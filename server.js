const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const usersFile = path.join(__dirname, 'users.json');

function getUsers() {
  if (!fs.existsSync(usersFile)) return [];
  const data = fs.readFileSync(usersFile, 'utf8');
  return data ? JSON.parse(data) : [];
}

// POST: Register a new student
app.post('/api/register', (req, res) => {
  const { fullName, email, phone, event, password } = req.body;
  const users = getUsers();

  // Check if this GCIT email already registered for the same event
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
});

// GET: View all saved registrations
app.get('/api/users', (req, res) => {
  res.json(getUsers());
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
