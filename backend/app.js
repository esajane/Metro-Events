const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./database");
const authenticateToken = require("./middleware/authMiddleware");
const init = require("./init");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
//test endpoint
app.get("/test", (req, res) => {
  res.send("Welcome to the server");
});

async function checkConnection() {
  try {
    await db.getConnection();
    console.log("Database connected");

    // initialize ang tables sa database
    await init();
  } catch (error) {
    console.error("Error connecting to the database: ", error);
  }
}

checkConnection();

// Event Endpoints
app.use("/events", require("./routes/eventRoutes"));

// Registration Endpoint
app.post("/register", async (req, res) => {
  try {
    const { firstname, lastname, username, email, password } = req.body;
    const role = "user";
    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await db.execute(
      "INSERT INTO users (firstname, lastname, username, email, password, role) VALUES (?, ?, ?, ?, ?, ?)",
      [firstname, lastname, username, email, hashedPassword, role]
    );

    res.status(201).send({ message: "User created", userId: result.insertId });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error registering new user", error: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [user] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (user.length === 0) {
      return res.status(401).send({ message: "Invalid email or password" });
    }

    const isValidPassword = await bcrypt.compare(password, user[0].password);

    if (!isValidPassword) {
      return res.status(401).send({ message: "Invalid email or password" });
    }

    const payload = {
      id: user[0].id,
      username: user[0].username,
      role: user[0].role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);
    console.log(user[0]);

    res.send({ message: user[0], token });
  } catch (error) {
    res.status(500).send({ message: "Login failed", error: error.message });
  }
});


app.get('/events', async (req, res) => {

    const [events] = await db.query('SELECT * FROM events WHERE status = "active"');
    res.json({ message: "Events endpoint reached successfully" });
    res.json({ events });
});


app.get('/users/events', authenticateToken, async (req, res) => {
    
    const userId = req.user.id; 

    const [userEvents] = await db.query(`
        SELECT e.id, e.name, e.date, p.status
        FROM events e
        INNER JOIN participants p ON p.eventId = e.id
        WHERE p.userId = ? AND e.status = 'active'`, [userId]);

    res.json({ events: userEvents });
});


app.post('/events/:eventId/participants', async (req, res) => {
    const eventId = req.params.eventId;
    const userId = req.user.id; 

    try {
        
        const [existingParticipant] = await db.query(
            'SELECT * FROM participants WHERE eventId = ? AND userId = ?',
            [eventId, userId]
        );

        if (existingParticipant.length > 0) {
            return res.status(400).json({ message: 'User already a participant' });
        }

        
        const [result] = await db.query(
            'INSERT INTO participants (eventId, userId, status) VALUES (?, ?, "pending")',
            [eventId, userId]
        );

        return res.status(201).json({ message: 'Request to join event submitted', participantId: result.insertId });
    } catch (error) {
        console.error('Error joining event:', error);
        return res.status(500).json({ message: 'Error joining event', error: error.message });
    }
});


app.delete('/events/:eventId/participants', async (req, res) => {
    const eventId = req.params.eventId;
    const userId = req.user.id; 

    try {
       
        const [existingParticipant] = await db.query(
            'SELECT * FROM participants WHERE eventId = ? AND userId = ?',
            [eventId, userId]
        );

        if (existingParticipant.length === 0) {
            return res.status(400).json({ message: 'User is not a participant' });
        }

       
        await db.query(
            'DELETE FROM participants WHERE eventId = ? AND userId = ?',
            [eventId, userId]
        );

        return res.status(200).json({ message: 'User successfully left the event' });
    } catch (error) {
        console.error('Error leaving event:', error);
        return res.status(500).json({ message: 'Error leaving event', error: error.message });
    }
});
