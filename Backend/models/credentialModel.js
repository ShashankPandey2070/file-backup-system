const db = require('../config/db');

exports.getCredentialById = async (id) => {
  const [rows] = await db.promise().query('SELECT * FROM credentials WHERE id = ?', [id]);
  return rows[0];
};

exports.getAllCredentialsByUser = async (user) => {
  const [rows] = await db.promise().query('SELECT * FROM credentials;');
  return rows;
};

exports.saveCredential = async ({ host, user, password }) => {
  const [result] = await db.promise().query(
    'INSERT INTO credentials (host, user, password) VALUES (?, ?, ?)',
    [host, user, password]
  );
  return result.insertId;
};

exports.credentialExists = async (host, user) => {
  const [rows] = await db.promise().query(
    'SELECT * FROM credentials WHERE host = ? AND user = ?',
    [host, user]
  );
  return rows.length > 0;
};

exports.deleteCredential = async (id) => {
  const [result] = await db.promise().query('DELETE FROM credentials WHERE id = ?', [id]);
  return result.affectedRows;
};
