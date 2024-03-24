const mysql = require("mysql2/promise");
const db = require("../database");

exports.getAllEvents = async (req, res) => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        date DATETIME NOT NULL,
        location VARCHAR(255) NOT NULL,
        organizerId INT,
        FOREIGN KEY (organizerId) REFERENCES users(id)
      )
    `);

    const [rows] = await db.query("SELECT * FROM events");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getEventById = async (req, res) => {
  const eventId = req.params.eventId;
  try {
    const [rows] = await db.query("SELECT * FROM events WHERE id = ?", [
      eventId,
    ]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: "Event not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createEvent = async (req, res) => {
  const user = req.user;

  if (user.role !== "organizer") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { name, description, date, location } = req.body;
  const organizerId = user.id;
  try {
    await db.query(
      "INSERT INTO events (name, description, date, location, organizerId) VALUES (?, ?, ?, ?, ?)",
      [name, description, date, location, organizerId]
    );
    res.status(201).json({ message: "Event created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateEvent = async (req, res) => {
  const user = req.user;

  if (user.role !== "organizer") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const eventId = req.params.eventId;
  const { name, description, date, location } = req.body;
  const organizerId = user.id;
  try {
    // check if event organizer is the same as the user making the request
    const [eventRows] = await db.query(
      "SELECT * FROM events WHERE id = ? AND organizerId = ?",
      [eventId, organizerId]
    );

    if (eventRows.length === 0) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await db.query(
      "UPDATE events SET name = ?, description = ?, date = ?, location = ? WHERE id = ?",
      [name, description, date, location, eventId]
    );
    res.json({ message: "Event updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.cancelEvent = async (req, res) => {
  const user = req.user;

  if (user.role !== "organizer") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const eventId = req.params.eventId;
  const organizerId = user.id;
  try {
    const [eventRows] = await db.query(
      "SELECT * FROM events WHERE id = ? AND organizerId = ?",
      [eventId, organizerId]
    );

    if (eventRows.length === 0) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await db.query("DELETE FROM events WHERE id = ?", [eventId]);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.requestToJoinEvent = async (req, res) => {
  const user = req.user;
  const eventId = req.params.eventId;
  const userId = user.id;
  try {
    const [existingRows] = await pool.query(
      "SELECT * FROM Participants WHERE eventId = ? AND userId = ? AND status IN (?, ?)",
      [eventId, userId, "confirmed", "pending"]
    );
    if (existingRows.length > 0) {
      return res.status(400).json({
        message:
          "User already a participant or has a pending request for this event",
      });
    }

    await pool.query(
      "INSERT INTO JoinRequests (eventId, userId) VALUES (?, ?)",
      [eventId, userId]
    );
    res
      .status(201)
      .json({ message: "Request to join event sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.acceptJoinRequest = async (req, res) => {
  const { requestId } = req.params;
  try {
    const [requestRows] = await pool.query(
      "SELECT * FROM JoinRequests WHERE id = ?",
      [requestId]
    );
    if (requestRows.length === 0) {
      return res.status(404).json({ message: "Join request not found" });
    }

    await pool.query("UPDATE JoinRequests SET status = ? WHERE id = ?", [
      "accepted",
      requestId,
    ]);
    res.json({ message: "Join request accepted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.rejectJoinRequest = async (req, res) => {
  const { requestId } = req.params;
  try {
    const [requestRows] = await pool.query(
      "SELECT * FROM JoinRequests WHERE id = ?",
      [requestId]
    );
    if (requestRows.length === 0) {
      return res.status(404).json({ message: "Join request not found" });
    }

    await pool.query("UPDATE JoinRequests SET status = ? WHERE id = ?", [
      "rejected",
      requestId,
    ]);
    res.json({ message: "Join request rejected successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
