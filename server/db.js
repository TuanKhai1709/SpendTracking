const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'spendtracker.db');

let _wrapper = null;

function saveToFile(sqlDb) {
  const data = sqlDb.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function createWrapper(sqlDb) {
  return {
    prepare(sql) {
      return {
        all(...params) {
          const stmt = sqlDb.prepare(sql);
          if (params.length > 0) stmt.bind(params);
          const results = [];
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
          stmt.free();
          return results;
        },
        get(...params) {
          const stmt = sqlDb.prepare(sql);
          if (params.length > 0) stmt.bind(params);
          let result;
          if (stmt.step()) {
            result = stmt.getAsObject();
          }
          stmt.free();
          return result;
        },
        run(...params) {
          sqlDb.run(sql, params);
          const idStmt = sqlDb.prepare('SELECT last_insert_rowid() as id');
          let lastId = 0;
          if (idStmt.step()) {
            lastId = idStmt.getAsObject().id;
          }
          idStmt.free();
          saveToFile(sqlDb);
          return { lastInsertRowid: lastId };
        },
      };
    },
    exec(sql) {
      sqlDb.exec(sql);
      saveToFile(sqlDb);
    },
  };
}

async function init() {
  const SQL = await initSqlJs();

  let sqlDb;
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    sqlDb = new SQL.Database(buffer);
  } else {
    sqlDb = new SQL.Database();
  }

  const wrapper = createWrapper(sqlDb);
  _wrapper = wrapper;

  wrapper.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS income (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  return wrapper;
}

function getDb() {
  if (!_wrapper) throw new Error('Database not initialized');
  return _wrapper;
}

module.exports = { init, getDb };
