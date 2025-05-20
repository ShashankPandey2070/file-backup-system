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

        const baseFolder = path.join('E:/sqlbackup', 'exports');
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

            stream.write(isFirstChunk ? csvChunk : '\n' + csvChunk.split('\n').slice(1).join('\n'));
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