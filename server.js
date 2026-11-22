const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Use /tmp on cloud hosts (guaranteed writable) and project folder locally
const usersFile = process.env.RENDER
  ? path.join(os.tmpdir(), 'users.json')
  : path.join(__dirname, 'users.json');

function getUsers() {
  try {
    if (!fs.existsSync(usersFile)) return [];
    const data = fs.readFileSync(usersFile, 'utf8');
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Read error:', err);
    return [];
  }
}

// POST: Register a new student
app.post('/api/register', (req, res) => {
  try {
    const { fullName, email, phone, event, password } = req.body;
    const users = getUsers();

    const alreadyRegistered = users.some(
      (u) => u.email === email && u.event === event
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        message: 'This GCIT email is already registered for this event.'
      });
    }

    const newUser = {
      id: Date.now(),
      fullName,
      email,
      phone,
      event,
      password,
      registeredAt: new Date().toISOString()
    };

    users.push(newUser);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    console.log('Saved registration:', newUser.email, 'for', newUser.event);
    res.status(201).json({ message: 'Registration successful!' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// GET: View all saved registrations
app.get('/api/users', (req, res) => {
  res.json(getUsers());
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
