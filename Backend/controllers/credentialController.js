const mysql = require('mysql2');
const model = require('../models/credentialModel');

exports.checkCredentials = async (req, res) => {
  const { host, user, password } = req.body;
  if (!host || !user || !password) return res.status(400).json({ error: 'All fields are required' });

  const testConn = require('mysql2').createConnection({ host, user, password });
  testConn.connect((err) => {
    if (err) return res.status(401).json({ error: 'Invalid credentials' });
    testConn.end();
    return res.status(200).json({ success: 'Valid credentials' });
  });
};

exports.saveCredentials = async (req, res) => {
  const { host, user, password } = req.body;
  if (!host || !user || !password) return res.status(400).json({ error: 'All fields are required' });

  try {
    // const exists = await model.credentialExists(host, user);
    // if (exists) return res.status(400).json({ error: 'Credentials already exist' });

    const id = await model.saveCredential({ host, user, password });
    res.status(200).json({ message: 'Credentials saved successfully', id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllCredentials = async (req, res) => {
  const { user } = req.query;
  // if (!user) return res.status(400).json({ error: 'User is required' });

  try {
    const results = await model.getAllCredentialsByUser(user);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch credentials' });
  }
};

exports.deleteCredential = async (req, res) => {
  const { connId } = req.query;
  if (!connId) return res.status(400).json({ error: 'ID is required' });

  try {
    const rowsAffected = await model.deleteCredential(connId);
    if (rowsAffected === 0) return res.status(404).json({ error: 'Credential not found' });

    res.status(200).json({ message: 'Credentials deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getDatabasesAndTables = async (req, res) => {
    const { dbId } = req.query;

    if (!dbId) {
        return res.status(400).json({ error: 'dbId is required' });
    }

    try {
        const credential = await model.getCredentialById(dbId);
        if (!credential) {
            return res.status(404).json({ error: 'Credentials not found' });
        }

        const { host, user, password } = credential;

        const connection = mysql.createConnection({
            host,
            user,
            password,
            multipleStatements: true
        });

        connection.connect((err) => {
            if (err) {
                console.error('Error connecting to the database:', err);
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const sql = `
                SELECT schema_name 
                FROM information_schema.schemata
                WHERE schema_name NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys');
            `;

            connection.query(sql, async (err, dbResults) => {
                if (err) {
                    connection.end();
                    return res.status(500).json({ error: 'Error fetching databases' });
                }

                const dbs = dbResults.map(row => row.SCHEMA_NAME);

                const fetchTables = (dbName) => {
                    return new Promise((resolve, reject) => {
                        connection.query(
                            `SELECT table_name FROM information_schema.tables WHERE table_schema = ?;`,
                            [dbName],
                            (err, tables) => {
                                if (err) return reject(err);
                                resolve({
                                    database: dbName,
                                    tables: tables.map(t => t.TABLE_NAME)
                                });
                            }
                        );
                    });
                };

                try {
                    const allDbDetails = await Promise.all(dbs.map(fetchTables));
                    connection.end();
                    return res.status(200).json(allDbDetails);
                } catch (error) {
                    connection.end();
                    return res.status(500).json({ error: 'Error fetching tables' });
                }
            });
        });
    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.insertDummyValues = async (req,res) => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: book_log,
  });

  const sql = 'INSERT INTO users ( user_id, book_title, page_number, note) VALUES (?, ?,?)';
  const [result] = await pool.execute(sql, [email, pwdHash]);

  return res.status(200).json(result);
}