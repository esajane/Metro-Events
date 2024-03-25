const db = require("./database");

const init = async () => {
  try {
    // init the events table
    await db.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(255),
        date DATETIME NOT NULL,
        location VARCHAR(255) NOT NULL,
        image_url VARCHAR(255),
        organizerId INT,
        status ENUM('active', 'cancelled') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (organizerId) REFERENCES users(id)
      )
    `);

    // init the notifications table
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        recipientId INT,
        eventId INT,
        message TEXT,
        status VARCHAR(20) DEFAULT 'unread',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (eventId) REFERENCES events(id),
        FOREIGN KEY (recipientId) REFERENCES users(id)
      )
    `);

    // init the participants table
    await db.query(`
      CREATE TABLE IF NOT EXISTS participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        eventId INT,
        userId INT,
        status ENUM('confirmed', 'pending') DEFAULT 'pending',
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (eventId) REFERENCES events(id),
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // init the upvotes table
    await db.query(`
      CREATE TABLE IF NOT EXISTS upvotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        eventId INT,
        userId INT,
        FOREIGN KEY (eventId) REFERENCES events(id),
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // init the reviews table
    await db.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        eventId INT,
        userId INT,
        rating INT,
        review TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (eventId) REFERENCES events(id),
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    console.log("Tables initialized successfully");
  } catch (error) {
    console.error("Error initializing tables:", error);
  }
};

module.exports = init;