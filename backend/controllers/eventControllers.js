const mysql = require("mysql2/promise");
const db = require("../database");

async function createNotification(type, recipientId, eventId, message) {
  try {
    await db.query(
      "INSERT INTO notifications (type, recipientId, eventId, message) VALUES (?, ?, ?, ?)",
      [type, recipientId, eventId, message]
    );
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

exports.getAllEvents = async (req, res) => {
  try {
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
    // Create the event in the database with status 'active'
    await db.query(
      "INSERT INTO events (name, description, date, location, organizerId, status) VALUES (?, ?, ?, ?, ?, ?)",
      [name, description, date, location, organizerId, "active"]
    );
    // return the event
    res
      .status(201)
      .json({ event: { name, description, date, location, organizerId } });
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

    await db.query("UPDATE events SET status = ? WHERE id = ?", [
      "cancelled",
      eventId,
    ]);

    const [participantRows] = await db.query(
      "SELECT userId FROM Participants WHERE eventId = ? AND status = ?",
      [eventId, "confirmed"]
    );

    // Notify cancel
    const notifications = participantRows.map(async (participant) => {
      const recipientId = participant.userId;
      await db.query(
        "INSERT INTO notifications (type, recipientId, eventId, message) VALUES (?, ?, ?, ?)",
        ["event_cancelled", recipientId, eventId, `Event has been cancelled`]
      );
    });

    await Promise.all(notifications);

    res.json({ message: "Event cancelled successfully" });
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
    const [existingRows] = await db.query(
      "SELECT * FROM Participants WHERE eventId = ? AND userId = ? AND status IN (?, ?)",
      [eventId, userId, "confirmed", "pending"]
    );
    if (existingRows.length > 0) {
      return res.status(400).json({
        message:
          "User already a participant or has a pending request for this event",
      });
    }

    await db.query(
      "INSERT INTO Participants (eventId, userId, status) VALUES (?, ?, ?)",
      [eventId, userId, "pending"]
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
  const { eventId, requestId } = req.params;
  try {
    await db.query(
      "UPDATE Participants SET status = ? WHERE eventId = ? AND id = ?",
      ["confirmed", eventId, requestId]
    );

    const [joinRequest] = await db.query(
      "SELECT userId FROM Participants WHERE eventId = ? AND id = ?",
      [eventId, requestId]
    );
    const userId = joinRequest[0].userId;

    // Notify accept
    await createNotification(
      "join_request_accepted",
      userId,
      eventId,
      "Your join request has been accepted"
    );

    res.json({ message: "Join request accepted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.rejectJoinRequest = async (req, res) => {
  const { eventId, requestId } = req.params;
  try {
    const [joinRequest] = await db.query(
      "SELECT userId FROM Participants WHERE eventId = ? AND id = ?",
      [eventId, requestId]
    );
    const userId = joinRequest[0].userId;

    await db.query("DELETE FROM Participants WHERE eventId = ? AND id = ?", [
      eventId,
      requestId,
    ]);

    // Notify reject
    await createNotification(
      "join_request_rejected",
      userId,
      eventId,
      "Your join request has been rejected"
    );

    res.json({ message: "Join request rejected successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUserNotifications = async (req, res) => {
  const user = req.user;

  try {
    const [notificationRows] = await db.query(
      `
      SELECT n.id, n.type, n.recipientId, e.name as eventName, e.description as eventDescription, n.message, n.status, n.created_at
      FROM notifications n
      LEFT JOIN events e ON n.eventId = e.id
      WHERE n.recipientId = ?
    `,
      [user.id]
    );

    res.json(notificationRows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.upvoteEvent = async (req, res) => {
  const userId = req.user.id;
  const eventId = req.params.eventId;

  try {
    const [existingUpvote] = await db.query(
      "SELECT * FROM upvotes WHERE userId = ? AND eventId = ?",
      [userId, eventId]
    );

    if (existingUpvote.length > 0) {
      return res
        .status(400)
        .json({ message: "User has already upvoted this event" });
    }

    await db.query("INSERT INTO Upvotes (userId, eventId) VALUES (?, ?)", [
      userId,
      eventId,
    ]);

    res.status(201).json({ message: "Event upvoted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.submitReview = async (req, res) => {
  const userId = req.user.id;
  const eventId = req.params.eventId;
  const { rating, review } = req.body;

  try {
    await db.query(
      "INSERT INTO reviews (userId, eventId, rating, review) VALUES (?, ?, ?, ?)",
      [userId, eventId, rating, review]
    );

    res.status(201).json({ message: "Review submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
