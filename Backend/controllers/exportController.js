const mysql = require('mysql2');
const path = require('path');
const fs = require('fs-extra');
const { parse } = require('json2csv');
const { getCredentialById } = require('../models/credentialModel');

const CHUNK_SIZE = 1000;
// without backup
// exports.exportTable = async (req, res) => {
//     const { dbId, dbName, table } = req.query;

//     if (!dbId || !dbName || !table) return res.status(400).json({ error: 'All fields are required' });

//     try {
//         const creds = await getCredentialById(dbId);
//         const connection = mysql.createConnection({
//             host: creds.host,
//             user: creds.user,
//             password: creds.password,
//             database: dbName
//         }).promise();

//         const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//         const folderName = `${table}_${timestamp}`;
//         const folderPath = path.join('E:/sqlbackup', 'exports', folderName);
//         await fs.ensureDir(folderPath);

//         const csvPath = path.join(folderPath, `${table}.csv`);
//         const ddlPath = path.join(folderPath, `${table}_ddl.txt`);
//         const stream = fs.createWriteStream(csvPath, { encoding: 'utf8' });

//         let offset = 0;
//         let isFirstChunk = true;

//         while (true) {
//             const [rows] = await connection.query(`SELECT * FROM \`${table}\` LIMIT ${CHUNK_SIZE} OFFSET ${offset}`);
//             if (rows.length === 0) break;

//             const csvChunk = parse(rows, {
//                 fields: Object.keys(rows[0]),
//                 header: isFirstChunk
//             });

//             stream.write(isFirstChunk ? csvChunk : '\n' + csvChunk.split('\n').slice(1).join('\n'));
//             isFirstChunk = false;
//             offset += CHUNK_SIZE;
//         }

//         stream.end();
//         await new Promise(resolve => stream.on('finish', resolve));

//         const [ddlResult] = await connection.query(`SHOW CREATE TABLE \`${table}\``);
//         if(ddlResult[0]['Create Table'])
//         await fs.writeFile(ddlPath, ddlResult[0]['Create Table']);

//         await connection.end();
//         res.status(200).json({ message: 'Export complete' });

//     } catch (err) {
//         console.error('Export error:', err);
//         res.status(500).json({ error: 'Export failed' });
//     }
// };

// with backup
exports.exportTable = async (req, res) => {
    const { dbId, dbName, table, resume = 'true' } = req.query;

    if (!dbId || !dbName || !table) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const creds = await getCredentialById(dbId);

        const connection = mysql.createConnection({
            host: creds.host,
            user: creds.user,
            password: creds.password,
            database: dbName
        }).promise();

        const baseFolder = path.join(process.env.BACK_UP_FOLDER_PATH, 'exports');
        await fs.ensureDir(baseFolder);

        // Find or create export folder
        let folderName, folderPath, offset = 0, isResume = false;

        const folders = await fs.readdir(baseFolder);
        for (const f of folders) {
            if (f.startsWith(`${table}_`)) {
                const potentialMeta = path.join(baseFolder, f, `${table}.csv.meta.json.tmp`);
                if (await fs.pathExists(potentialMeta)) {
                    const meta = await fs.readJson(potentialMeta);
                    if (meta.status === 'in_progress' && resume === 'true') {
                        folderName = f;
                        folderPath = path.join(baseFolder, folderName);
                        offset = meta.offset || 0;
                        isResume = true;
                        break;
                    }
                }
            }
        }

        if (!folderPath) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            folderName = `${table}_${timestamp}`;
            folderPath = path.join(baseFolder, folderName);
            await fs.ensureDir(folderPath);
        }

        const metaTmpPath = path.join(folderPath, `${table}.csv.meta.json.tmp`);
        const csvTmpPath = path.join(folderPath, `${table}.csv.tmp`);
        const csvFinalPath = path.join(folderPath, `${table}.csv`);
        const ddlPath = path.join(folderPath, `${table}_ddl.txt`);

        // Start metadata tracking
        await fs.writeJson(metaTmpPath, {
            table,
            offset,
            status: 'in_progress',
            createdAt: new Date().toISOString()
        });

        const stream = fs.createWriteStream(csvTmpPath, { flags: isResume ? 'a' : 'w', encoding: 'utf8' });
        let isFirstChunk = offset === 0;

        while (true) {
            const [rows] = await connection.query(`SELECT * FROM \`${table}\` LIMIT ${CHUNK_SIZE} OFFSET ${offset}`);
            if (rows.length === 0) break;

            const csvChunk = parse(rows, {
                fields: Object.keys(rows[0]),
                header: isFirstChunk
            });
            // console.log(csvChunk)
            stream.write('\n'+csvChunk);
            isFirstChunk = false;
            offset += CHUNK_SIZE;

            // Update .tmp metadata after each chunk
            await fs.writeJson(metaTmpPath, {
                table,
                offset,
                status: 'in_progress',
                updatedAt: new Date().toISOString()
            });
            // res.status(200).json({ message: isResume ? 'Resumed and completed export' : 'Export complete' });
        }

        stream.end();
        await new Promise(resolve => stream.on('finish', resolve));

        // Write DDL if it doesn't exist
        if (!await fs.pathExists(ddlPath)) {
            const [ddlResult] = await connection.query(`SHOW CREATE TABLE \`${table}\``);
            if (ddlResult[0]['Create Table']) {
                await fs.writeFile(ddlPath, ddlResult[0]['Create Table']);
            }
        }

        // Finalize: rename .csv.tmp → .csv, delete .meta.json.tmp
        await fs.rename(csvTmpPath, csvFinalPath);
        await fs.remove(metaTmpPath);

        await connection.end();

        res.status(200).json({ message: isResume ? 'Resumed and completed export' : 'Export complete' });

    } catch (err) {
        console.error('Export error:', err);
        res.status(500).json({ error: 'Export failed', details: err.message });
    }
};


exports.exportDatabase = async (req, res) => {
    const { dbId, dbName, tables } = req.body;
    if (!dbId || !dbName || !tables) return res.status(400).json({ error: 'All fields are required' });

    try {
        const creds = await getCredentialById(dbId);
        const conn = mysql.createConnection({ host: creds.host, user: creds.user, password: creds.password, database: dbName }).promise();

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const folderPath = path.join(process.env.BACK_UP_FOLDER_PATH, 'exports', `${dbName}_${timestamp}`);
        await fs.ensureDir(folderPath);

        for (const table of tables) {
            const tableFolder = path.join(folderPath, table);
            await fs.ensureDir(tableFolder);

            const csvStream = fs.createWriteStream(path.join(tableFolder, `${table}.csv`));
            let offset = 0;
            let isFirstChunk = true;

            while (true) {
                const [rows] = await conn.query(`SELECT * FROM \`${table}\` LIMIT ${CHUNK_SIZE} OFFSET ${offset}`);
                if (rows.length === 0) break;

                const csvChunk = parse(rows, { fields: Object.keys(rows[0]), header: isFirstChunk });
                csvStream.write(isFirstChunk ? csvChunk : '\n' + csvChunk.split('\n').slice(1).join('\n'));
                isFirstChunk = false;
                offset += CHUNK_SIZE;
            }

            csvStream.end();
            await new Promise(resolve => csvStream.on('finish', resolve));

            const [ddlResult] = await conn.query(`SHOW CREATE TABLE \`${table}\``);
            if(ddlResult[0]['Create Table'])
            await fs.writeFile(path.join(tableFolder, `${table}_ddl.txt`), ddlResult[0]['Create Table']);
        }

        await conn.end();
        res.status(200).json({ message: 'Database export completed' });

    } catch (err) {
        console.error('Database export error:', err);
        res.status(500).json({ error: 'Failed to export database' });
    }
};

exports.exportDatabases = async (req, res) => {
    const { dbId, databases } = req.body;
    if (!dbId || !databases) return res.status(400).json({ error: 'All fields are required' });

    try {
        const creds = await getCredentialById(dbId);
        const conn = mysql.createConnection({ host: creds.host, user: creds.user, password: creds.password }).promise();

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const basePath = path.join(process.env.BACK_UP_FOLDER_PATH, 'exports', `${creds.user}_${timestamp}`);
        await fs.ensureDir(basePath);

        for (const dbName of databases) {
            await conn.changeUser({ database: dbName });
            const [tables] = await conn.query('SHOW TABLES');
            const tableKey = `Tables_in_${dbName}`;
            const dbFolder = path.join(basePath, dbName);
            await fs.ensureDir(dbFolder);

            for (const tableRow of tables) {
                const tableName = tableRow[tableKey];
                const tableFolder = path.join(dbFolder, tableName);
                await fs.ensureDir(tableFolder);

                const csvStream = fs.createWriteStream(path.join(tableFolder, `${tableName}.csv`));
                let offset = 0;
                let isFirstChunk = true;

                while (true) {
                    const [rows] = await conn.query(`SELECT * FROM \`${tableName}\` LIMIT ${CHUNK_SIZE} OFFSET ${offset}`);
                    if (rows.length === 0) break;

                    const csvChunk = parse(rows, { fields: Object.keys(rows[0]), header: isFirstChunk });
                    csvStream.write(isFirstChunk ? csvChunk : '\n' + csvChunk.split('\n').slice(1).join('\n'));
                    isFirstChunk = false;
                    offset += CHUNK_SIZE;
                }

                csvStream.end();
                await new Promise(resolve => csvStream.on('finish', resolve));

                const [ddlResult] = await conn.query(`SHOW CREATE TABLE \`${tableName}\``);
                if(ddlResult[0]['Create Table'])
                await fs.writeFile(path.join(tableFolder, `${tableName}_ddl.txt`), ddlResult[0]['Create Table']);
            }
        }

        await conn.end();
        res.status(200).json({ message: 'Databases exported successfully' });

    } catch (err) {
        console.error('Export error:', err);
        res.status(500).json({ error: 'Failed to export databases' });
    }
};
