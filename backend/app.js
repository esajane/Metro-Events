const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./database");

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
