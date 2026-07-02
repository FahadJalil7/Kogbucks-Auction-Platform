const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

let dbInstance = null;

async function getDb() {
    if (dbInstance) return dbInstance;

    dbInstance = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    await dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            password TEXT,
            role TEXT,
            name TEXT,
            kogbucks_balance INTEGER DEFAULT 0,
            kogbucks_on_hold INTEGER DEFAULT 0,
            otp TEXT
        );

        CREATE TABLE IF NOT EXISTS auctions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            startTime TEXT,
            endTime TEXT,
            finalized INTEGER DEFAULT 0,
            notifiedEndingSoon INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            auctionId INTEGER,
            name TEXT,
            description TEXT,
            value REAL,
            startingBid REAL,
            currentBid REAL,
            type TEXT,
            imageUrl TEXT,
            bidCount INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS bids (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            itemId INTEGER,
            userId INTEGER,
            amount REAL,
            timestamp TEXT
        );

        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            userId INTEGER,
            message TEXT,
            type TEXT,
            read INTEGER DEFAULT 0,
            timestamp TEXT
        );

        CREATE TABLE IF NOT EXISTS chat_messages (
            id TEXT PRIMARY KEY,
            auctionId INTEGER,
            userId INTEGER,
            userName TEXT,
            role TEXT,
            text TEXT,
            isAnnouncement INTEGER DEFAULT 0,
            timestamp TEXT
        );

        CREATE TABLE IF NOT EXISTS invitations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            auctionId INTEGER,
            userId INTEGER
        );
    `);

    // Seed data
    const userCount = await dbInstance.get('SELECT COUNT(*) as count FROM users');
    if (userCount.count === 0) {
        await dbInstance.run(`INSERT INTO users (email, password, role, name, kogbucks_balance, kogbucks_on_hold) VALUES (?, ?, ?, ?, ?, ?)`, ['admin@kognitive.com', 'admin', 'admin', 'Admin User', 1000, 0]);
        await dbInstance.run(`INSERT INTO users (email, password, role, name, kogbucks_balance, kogbucks_on_hold) VALUES (?, ?, ?, ?, ?, ?)`, ['user@kognitive.com', 'user', 'user', 'Sales Rep', 250, 0]);
        await dbInstance.run(`INSERT INTO users (email, password, role, name, kogbucks_balance, kogbucks_on_hold) VALUES (?, ?, ?, ?, ?, ?)`, ['user2@kognitive.com', 'user2', 'user', 'Sales Rep 2', 300, 0]);
        
        const now = Date.now();
        const past = new Date(now - 2 * 60 * 60 * 1000).toISOString();
        const future = new Date(now + 24 * 60 * 60 * 1000).toISOString();
        const auction1Res = await dbInstance.run(`INSERT INTO auctions (title, startTime, endTime, finalized) VALUES (?, ?, ?, ?)`, ["Spring Collector's Auction", past, future, 0]);
        
        await dbInstance.run(`INSERT INTO items (auctionId, name, description, value, startingBid, currentBid, type, imageUrl, bidCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
          [auction1Res.lastID, "Vintage Film Camera", "A pristine condition 1970s film camera. Perfect for collectors and enthusiasts.", 150.0, 25.0, 55.0, "Physical", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80", 5]);
        await dbInstance.run(`INSERT INTO items (auctionId, name, description, value, startingBid, currentBid, type, imageUrl, bidCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
          [auction1Res.lastID, "$50 Amazon Gift Card", "Digital code for Amazon US.", 50.0, 10.0, 20.0, "Gift Card", "https://images.unsplash.com/photo-1512418490979-92798cec1380?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80", 2]);

        const a2PastStart = new Date(now - 48 * 60 * 60 * 1000).toISOString();
        const a2PastEnd = new Date(now - 1 * 60 * 60 * 1000).toISOString();
        const auction2Res = await dbInstance.run(`INSERT INTO auctions (title, startTime, endTime, finalized) VALUES (?, ?, ?, ?)`, ["Weekend Quick Auction", a2PastStart, a2PastEnd, 1]);
        await dbInstance.run(`INSERT INTO items (auctionId, name, description, value, startingBid, currentBid, type, imageUrl, bidCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
          [auction2Res.lastID, "Signed Basketball", "Basketball signed by the local team captain.", 200.0, 40.0, 80.0, "Physical", "https://images.unsplash.com/photo-1519861531473-920026393112?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80", 8]);
    }

    return dbInstance;
}

module.exports = { getDb };
