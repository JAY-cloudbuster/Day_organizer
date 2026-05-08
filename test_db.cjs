const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'server/database.sqlite');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error("Error opening database", err);
    process.exit(1);
  }
});

console.log("--- PROJECTS ---");
db.all("SELECT id, title, user_id, updated_at FROM projects", (err, rows) => {
  if (err) console.error(err);
  else console.table(rows);
  
  console.log("--- SCHEDULES ---");
  db.all("SELECT id, title, user_id, updated_at FROM schedules", (err, rows2) => {
    if (err) console.error(err);
    else console.table(rows2);
    db.close();
  });
});
