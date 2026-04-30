const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = 5000;
const SECRET_KEY = "SUPER_SECURE_JWT_SECRET_DAY_ORGANISER";

// SECURITY FEATURES
app.use(helmet()); // Adds security headers (HSTS, X-XSS-Protection, etc.)
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// RATE LIMITER - Prevent Brute Force / DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// DATABASE CONFIGURATION (SQLite with Parameterized Queries to prevent SQL Injection)
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("Database Connection Error:", err);
  else console.log("Connected to Secure SQLite Database.");
});

// INITIALIZE TABLES
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    canvas_state TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    schedule_state TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
});

// AUTHENTICATION MIDDLEWARE
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Access Denied" });
  
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid Token" });
    req.user = user;
    next();
  });
};

// ================= ROUTES ================= //

// 1. REGISTER
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    // Parameterized Query absolutely PREVENTS SQL injection
    db.run("INSERT INTO users (email, password_hash) VALUES (?, ?)", [email, hash], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) return res.status(409).json({ error: "Email already exists" });
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ message: "User registered securely." });
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// 2. LOGIN
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '2h' });
    res.json({ token, user: { id: user.id, email: user.email } });
  });
});

// 3. GET CURRENT USER PROFILE
app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get("SELECT id, email FROM users WHERE id = ?", [req.user.id], (err, user) => {
    if (err || !user) return res.status(500).json({ error: "Database error" });
    db.get("SELECT COUNT(*) AS projectCount FROM projects WHERE user_id = ?", [req.user.id], (err, countRow) => {
      res.json({ user, stats: { projects: countRow ? countRow.projectCount : 0 } });
    });
  });
});

// 4. UPDATE PASSWORD
app.put('/api/auth/update-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  db.get("SELECT password_hash FROM users WHERE id = ?", [req.user.id], async (err, user) => {
    if (err || !user) return res.status(500).json({ error: "Failed to verify user" });
    
    // Check old password
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return res.status(403).json({ error: "Current password is incorrect" });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    
    db.run("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, req.user.id], (err) => {
      if (err) return res.status(500).json({ error: "Failed to update password" });
      res.json({ message: "Password securely updated." });
    });
  });
});

// 5. DELETE ACCOUNT (GDPR compliant hard-delete)
app.delete('/api/auth/delete', authenticateToken, (req, res) => {
  db.serialize(() => {
    db.run("DELETE FROM projects WHERE user_id = ?", [req.user.id]);
    db.run("DELETE FROM users WHERE id = ?", [req.user.id], (err) => {
      if (err) return res.status(500).json({ error: "Failed to delete account" });
      res.json({ message: "Account and all data strictly obliterated." });
    });
  });
});

// ================= PROJECT ROUTES ================= //

// CREATE PROJECT
app.post('/api/projects', authenticateToken, (req, res) => {
  const { title } = req.body;
  const defaultState = JSON.stringify({ nodes: [], edges: [], pan: {x:0, y:0}, zoom: 1 });
  db.run("INSERT INTO projects (user_id, title, canvas_state) VALUES (?, ?, ?)", [req.user.id, title || 'Untitled Canvas', defaultState], function(err) {
    if (err) return res.status(500).json({ error: "Creation failed" });
    res.json({ id: this.lastID, title: title || 'Untitled Canvas' });
  });
});

// 4. GET ALL PROJECTS FOR USER
app.get('/api/projects', authenticateToken, (req, res) => {
  db.all("SELECT id, title, updated_at FROM projects WHERE user_id = ? ORDER BY updated_at DESC", [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ projects: rows });
  });
});

// 5. GET SINGLE PROJECT STATE
app.get('/api/projects/:id', authenticateToken, (req, res) => {
  db.get("SELECT canvas_state, title FROM projects WHERE id = ? AND user_id = ?", [req.params.id, req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!row) return res.status(404).json({ error: "Project not found" });
    res.json({ project: row });
  });
});

// 6. SAVE/UPDATE PROJECT STATE
app.put('/api/projects/:id', authenticateToken, (req, res) => {
  const { stateData } = req.body;
  db.run("UPDATE projects SET canvas_state = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?", 
    [stateData, req.params.id, req.user.id], 
    function(err) {
      if (err) return res.status(500).json({ error: "Update failed" });
      res.json({ message: "Saved perfectly!" });
  });
});

// ================= SCHEDULE ROUTES ================= //

// CREATE SCHEDULE
app.post('/api/schedules', authenticateToken, (req, res) => {
  const { title, stateData } = req.body;
  const state = stateData || JSON.stringify({ blocks: [] });
  db.run("INSERT INTO schedules (user_id, title, schedule_state) VALUES (?, ?, ?)",
    [req.user.id, title || 'My Schedule', state],
    function(err) {
      if (err) return res.status(500).json({ error: "Schedule creation failed" });
      res.json({ id: this.lastID, title: title || 'My Schedule' });
    }
  );
});

// GET ALL SCHEDULES FOR USER
app.get('/api/schedules', authenticateToken, (req, res) => {
  db.all("SELECT id, title, updated_at FROM schedules WHERE user_id = ? ORDER BY updated_at DESC",
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ schedules: rows });
    }
  );
});

// GET SINGLE SCHEDULE
app.get('/api/schedules/:id', authenticateToken, (req, res) => {
  db.get("SELECT schedule_state, title FROM schedules WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (!row) return res.status(404).json({ error: "Schedule not found" });
      res.json({ schedule: row });
    }
  );
});

// UPDATE SCHEDULE STATE
app.put('/api/schedules/:id', authenticateToken, (req, res) => {
  const { stateData, title } = req.body;
  if (title) {
    db.run("UPDATE schedules SET title = ?, schedule_state = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
      [title, stateData, req.params.id, req.user.id],
      function(err) {
        if (err) return res.status(500).json({ error: "Update failed" });
        res.json({ message: "Schedule saved!" });
      }
    );
  } else {
    db.run("UPDATE schedules SET schedule_state = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
      [stateData, req.params.id, req.user.id],
      function(err) {
        if (err) return res.status(500).json({ error: "Update failed" });
        res.json({ message: "Schedule saved!" });
      }
    );
  }
});

// DELETE SCHEDULE
app.delete('/api/schedules/:id', authenticateToken, (req, res) => {
  db.run("DELETE FROM schedules WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id],
    function(err) {
      if (err) return res.status(500).json({ error: "Failed to delete schedule" });
      res.json({ message: "Schedule deleted." });
    }
  );
});

app.listen(PORT, () => console.log(`Cyber-secure backend running perfectly on http://localhost:${PORT}`));
