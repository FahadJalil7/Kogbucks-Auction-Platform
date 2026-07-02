const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const { getDb } = require('./db');

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Helper to compute auction status
function getAuctionStatus(auction) {
    const now = new Date();
    if (new Date(auction.endTime) < now) return 'ended';
    if (new Date(auction.startTime) > now) return 'upcoming';
    return 'active';
}

// --- OTP Auth API (2-step passwordless) ---

// Step 1: Request OTP
app.post('/api/auth/request-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const db = await getDb();
    let user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

    // Auto-create new user if not found (passwordless registration)
    if (!user) {
        const name = email.split('@')[0].replace(/[^a-zA-Z0-9 ]/g, ' ');
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
        const result = await db.run(
            'INSERT INTO users (email, role, name, kogbucks_balance, kogbucks_on_hold) VALUES (?, ?, ?, ?, ?)',
            [email, 'user', formattedName, 0, 0]
        );
        user = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await db.run('UPDATE users SET otp = ? WHERE id = ?', [otp, user.id]);

    // In production: send via SMS/Email. For simulation, log to console.
    console.log(`\n========================================`);
    console.log(`🔑 OTP for ${email}: ${otp}`);
    console.log(`========================================\n`);

    res.json({ success: true, message: `OTP sent to ${email}. Check the server console for the OTP.` });
});

// Step 2: Verify OTP and login
app.post('/api/auth/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });

    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE email = ? AND otp = ?', [email, otp]);

    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    // Clear OTP after successful verification
    await db.run('UPDATE users SET otp = NULL WHERE id = ?', [user.id]);

    const { password, otp: _otp, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
});

// Get all users (admin only)
app.get('/api/users', async (req, res) => {
    const db = await getDb();
    const users = await db.all('SELECT id, email, role, name, kogbucks_balance, kogbucks_on_hold FROM users');
    res.json({ success: true, users });
});

// Add a new user (admin only)
app.post('/api/users', async (req, res) => {
    const { email, name, role, kogbucks_balance } = req.body;
    if (!email || !name) return res.status(400).json({ success: false, message: 'Email and name are required' });

    const db = await getDb();
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(409).json({ success: false, message: 'A user with this email already exists.' });

    const result = await db.run(
        'INSERT INTO users (email, role, name, kogbucks_balance, kogbucks_on_hold) VALUES (?, ?, ?, ?, ?)',
        [email, role || 'user', name, kogbucks_balance || 0, 0]
    );
    const user = await db.get('SELECT id, email, role, name, kogbucks_balance, kogbucks_on_hold FROM users WHERE id = ?', [result.lastID]);
    res.json({ success: true, user });
});

// Update user's kogbucks balance (admin only)
app.put('/api/users/:id/kogbucks', async (req, res) => {
    const userId = parseInt(req.params.id);
    const { kogbucks_balance } = req.body;

    if (typeof kogbucks_balance !== 'number' || kogbucks_balance < 0) {
        return res.status(400).json({ success: false, message: 'Invalid kogbucks balance' });
    }

    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await db.run('UPDATE users SET kogbucks_balance = ? WHERE id = ?', [kogbucks_balance, userId]);
    const updated = await db.get('SELECT id, email, role, name, kogbucks_balance, kogbucks_on_hold FROM users WHERE id = ?', [userId]);
    res.json({ success: true, user: updated, message: 'Kogbucks balance updated successfully' });
});

// --- Auction Events API ---

async function getAuctionWithItems(db, auction) {
    const auctionItems = await db.all('SELECT * FROM items WHERE auctionId = ?', [auction.id]);
    for (const item of auctionItems) {
        item.bids = await db.all('SELECT b.*, u.name as userName FROM bids b LEFT JOIN users u ON b.userId = u.id WHERE b.itemId = ?', [item.id]);
    }
    return { ...auction, status: getAuctionStatus(auction), items: auctionItems, itemCount: auctionItems.length };
}

// Get all auctions
app.get('/api/auctions', async (req, res) => {
    const db = await getDb();
    const auctions = await db.all('SELECT * FROM auctions');
    const result = await Promise.all(auctions.map(a => getAuctionWithItems(db, a)));
    res.json({ success: true, auctions: result });
});

// Get single auction
app.get('/api/auctions/:id', async (req, res) => {
    const db = await getDb();
    const auction = await db.get('SELECT * FROM auctions WHERE id = ?', [parseInt(req.params.id)]);
    if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });
    const full = await getAuctionWithItems(db, auction);
    res.json({ success: true, auction: full });
});

// Create new auction
app.post('/api/auctions', async (req, res) => {
    const { title, startTime, endTime, items: newItems } = req.body;
    const db = await getDb();

    const result = await db.run(
        'INSERT INTO auctions (title, startTime, endTime, finalized) VALUES (?, ?, ?, ?)',
        [title, startTime || new Date().toISOString(), endTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), 0]
    );
    const newAuction = await db.get('SELECT * FROM auctions WHERE id = ?', [result.lastID]);

    if (newItems && Array.isArray(newItems)) {
        for (const item of newItems) {
            await db.run(
                'INSERT INTO items (auctionId, name, description, value, startingBid, currentBid, type, imageUrl, bidCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [newAuction.id, item.name, item.description, parseFloat(item.value), parseFloat(item.startingBid) || 0, parseFloat(item.startingBid) || 0, item.type || 'Physical', item.imageUrl || '', 0]
            );
        }
    }

    const full = await getAuctionWithItems(db, newAuction);
    res.json({ success: true, auction: full });
});

// Update auction
app.put('/api/auctions/:id', async (req, res) => {
    const auctionId = parseInt(req.params.id);
    const { title, startTime, endTime } = req.body;
    const db = await getDb();

    const auction = await db.get('SELECT * FROM auctions WHERE id = ?', [auctionId]);
    if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });

    await db.run(
        'UPDATE auctions SET title = COALESCE(?, title), startTime = COALESCE(?, startTime), endTime = COALESCE(?, endTime) WHERE id = ?',
        [title || null, startTime || null, endTime || null, auctionId]
    );

    const updated = await db.get('SELECT * FROM auctions WHERE id = ?', [auctionId]);
    const full = await getAuctionWithItems(db, updated);
    res.json({ success: true, auction: full });
});

// --- Invite Participants ---
app.post('/api/auctions/:id/invite', async (req, res) => {
    const auctionId = parseInt(req.params.id);
    const { userIds } = req.body; // array of user IDs

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ success: false, message: 'Please provide at least one user to invite.' });
    }

    const db = await getDb();
    const auction = await db.get('SELECT * FROM auctions WHERE id = ?', [auctionId]);
    if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });

    let invited = [];
    for (const userId of userIds) {
        const user = await db.get('SELECT id, name FROM users WHERE id = ?', [userId]);
        if (!user) continue;

        // Check if already invited
        const existing = await db.get('SELECT id FROM invitations WHERE auctionId = ? AND userId = ?', [auctionId, userId]);
        if (!existing) {
            await db.run('INSERT INTO invitations (auctionId, userId) VALUES (?, ?)', [auctionId, userId]);
            await addNotification(db, userId, `You've been invited to the auction: "${auction.title}"!`, 'invitation');
            invited.push(user.name);
        }
    }

    // Broadcast new notification via socket
    io.emit('notification-update');
    res.json({ success: true, message: `Invited: ${invited.join(', ') || 'No new users invited (already invited).'}` });
});

// Get invited users for an auction
app.get('/api/auctions/:id/invitations', async (req, res) => {
    const auctionId = parseInt(req.params.id);
    const db = await getDb();
    const invitations = await db.all(
        'SELECT u.id, u.name, u.email FROM invitations i JOIN users u ON i.userId = u.id WHERE i.auctionId = ?',
        [auctionId]
    );
    res.json({ success: true, invitations });
});

// --- Place a Bid ---
app.post('/api/items/:id/bid', async (req, res) => {
    const itemId = parseInt(req.params.id);
    const { userId } = req.body;
    const db = await getDb();

    const item = await db.get('SELECT * FROM items WHERE id = ?', [itemId]);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    const auction = await db.get('SELECT * FROM auctions WHERE id = ?', [item.auctionId]);
    if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });

    const status = getAuctionStatus(auction);
    if (status === 'ended') return res.status(400).json({ success: false, message: 'This auction has ended' });
    if (status === 'upcoming') return res.status(400).json({ success: false, message: 'This auction has not started yet' });

    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const availBalance = user.kogbucks_balance - (user.kogbucks_on_hold || 0);
    if (availBalance <= 0) return res.status(400).json({ success: false, message: 'You have no available Kogbucks to bid.' });
    if (availBalance <= item.currentBid) return res.status(400).json({ success: false, message: 'Your available Kogbucks balance must be higher than the current bid' });

    // Check if user is already the highest bidder on any ACTIVE item
    const activeAuctions = await db.all('SELECT id FROM auctions WHERE finalized = 0');
    const activeAuctionIds = activeAuctions.map(a => a.id);

    for (const aId of activeAuctionIds) {
        const auctionData = await db.get('SELECT * FROM auctions WHERE id = ?', [aId]);
        if (getAuctionStatus(auctionData) !== 'active') continue;

        const auctionItems = await db.all('SELECT * FROM items WHERE auctionId = ?', [aId]);
        for (const aItem of auctionItems) {
            const lastBid = await db.get('SELECT * FROM bids WHERE itemId = ? ORDER BY id DESC LIMIT 1', [aItem.id]);
            if (lastBid && lastBid.userId === userId) {
                if (aItem.id === itemId) {
                    return res.status(400).json({ success: false, message: `You are already the highest bidder on this item.` });
                }
                return res.status(400).json({ success: false, message: `You already have an active bid on "${aItem.name}". You can only bid after you've been outbid.` });
            }
        }
    }

    // Outbid previous highest bidder
    const previousHighBid = await db.get('SELECT * FROM bids WHERE itemId = ? ORDER BY id DESC LIMIT 1', [itemId]);
    if (previousHighBid) {
        const prevUser = await db.get('SELECT * FROM users WHERE id = ?', [previousHighBid.userId]);
        if (prevUser) {
            const newOnHold = Math.max(0, (prevUser.kogbucks_on_hold || 0) - previousHighBid.amount);
            await db.run('UPDATE users SET kogbucks_on_hold = ? WHERE id = ?', [newOnHold, prevUser.id]);
            await addNotification(db, prevUser.id, `You have been outbid on "${item.name}"!`, 'outbid');
        }
    }

    // Place bid
    await db.run('UPDATE users SET kogbucks_on_hold = ? WHERE id = ?', [(user.kogbucks_on_hold || 0) + availBalance, userId]);
    await db.run('UPDATE items SET currentBid = ?, bidCount = bidCount + 1 WHERE id = ?', [availBalance, itemId]);
    await db.run('INSERT INTO bids (itemId, userId, amount, timestamp) VALUES (?, ?, ?, ?)', [itemId, userId, availBalance, new Date().toISOString()]);

    const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    const updatedItem = await db.get('SELECT * FROM items WHERE id = ?', [itemId]);
    updatedItem.bids = await db.all('SELECT b.*, u.name as userName FROM bids b LEFT JOIN users u ON b.userId = u.id WHERE b.itemId = ?', [itemId]);

    // Broadcast bid update via socket
    io.emit('bid-update', { itemId, auctionId: item.auctionId });
    io.emit('notification-update');

    res.json({
        success: true,
        item: updatedItem,
        message: 'Bid placed successfully. Funds are now on hold.',
        newBalance: updatedUser.kogbucks_balance,
        newOnHold: updatedUser.kogbucks_on_hold
    });
});

// --- Notifications ---
async function addNotification(db, userId, message, type) {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    await db.run(
        'INSERT INTO notifications (id, userId, message, type, read, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
        [id, userId, message, type, 0, new Date().toISOString()]
    );
}

app.get('/api/notifications/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    const db = await getDb();
    const notifications = await db.all(
        'SELECT * FROM notifications WHERE userId = ? ORDER BY timestamp DESC',
        [userId]
    );
    // Convert read 0/1 to boolean
    const mapped = notifications.map(n => ({ ...n, read: n.read === 1 }));
    res.json({ success: true, notifications: mapped });
});

app.put('/api/notifications/:id/read', async (req, res) => {
    const id = req.params.id;
    const db = await getDb();
    const notification = await db.get('SELECT * FROM notifications WHERE id = ?', [id]);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    await db.run('UPDATE notifications SET read = 1 WHERE id = ?', [id]);
    res.json({ success: true, notification: { ...notification, read: true } });
});

// --- Admin Reports ---
app.get('/api/admin/reports', async (req, res) => {
    const db = await getDb();
    const allItems = await db.all('SELECT * FROM items');
    const allAuctions = await db.all('SELECT * FROM auctions');
    const allUsers = await db.all('SELECT id, email, role, name, kogbucks_balance, kogbucks_on_hold FROM users');

    const realTimeBids = [];
    for (const item of allItems) {
        const auction = allAuctions.find(a => a.id === item.auctionId);
        const latestBid = await db.get('SELECT b.*, u.name as userName FROM bids b LEFT JOIN users u ON b.userId = u.id WHERE b.itemId = ? ORDER BY b.id DESC LIMIT 1', [item.id]);
        realTimeBids.push({
            itemId: item.id,
            itemName: item.name,
            auctionId: item.auctionId,
            auctionTitle: auction ? auction.title : 'Unknown',
            status: auction ? getAuctionStatus(auction) : 'unknown',
            startingBid: item.startingBid,
            currentBid: item.currentBid,
            bidCount: item.bidCount,
            latestBidderName: latestBid ? latestBid.userName || `User ${latestBid.userId}` : 'No bids',
            latestBidAmount: latestBid ? latestBid.amount : null,
            latestBidTime: latestBid ? latestBid.timestamp : null,
            type: item.type
        });
    }

    const finalSaleReports = [];
    for (const auction of allAuctions.filter(a => getAuctionStatus(a) === 'ended')) {
        const aItems = await db.all('SELECT * FROM items WHERE auctionId = ?', [auction.id]);
        for (const item of aItems) {
            const winningBid = await db.get('SELECT b.*, u.name as userName, u.email as userEmail FROM bids b LEFT JOIN users u ON b.userId = u.id WHERE b.itemId = ? ORDER BY b.id DESC LIMIT 1', [item.id]);
            finalSaleReports.push({
                itemId: item.id,
                itemName: item.name,
                auctionTitle: auction.title,
                endTime: auction.endTime,
                finalBid: winningBid ? winningBid.amount : null,
                winnerName: winningBid ? winningBid.userName || `User ${winningBid.userId}` : 'No bids',
                winnerEmail: winningBid ? winningBid.userEmail : null,
                startingBid: item.startingBid,
                value: item.value,
                type: item.type
            });
        }
    }

    const biddingPower = await Promise.all(
        allUsers.filter(u => u.role !== 'admin').map(async u => {
            const bidData = await db.get('SELECT COUNT(*) as totalBids, COALESCE(SUM(amount), 0) as totalSpent FROM bids WHERE userId = ?', [u.id]);
            return {
                userId: u.id,
                name: u.name,
                email: u.email,
                kogbucks_balance: u.kogbucks_balance,
                kogbucks_on_hold: u.kogbucks_on_hold || 0,
                totalKogbucks: u.kogbucks_balance + (u.kogbucks_on_hold || 0),
                totalBids: bidData.totalBids,
                totalSpent: bidData.totalSpent
            };
        })
    );
    biddingPower.sort((a, b) => b.totalKogbucks - a.totalKogbucks);

    res.json({ success: true, realTimeBids, finalSaleReports, biddingPower });
});

// --- Chat / Messaging ---
app.get('/api/chat/:auctionId', async (req, res) => {
    const auctionId = parseInt(req.params.auctionId);
    const db = await getDb();
    const messages = await db.all('SELECT * FROM chat_messages WHERE auctionId = ? ORDER BY timestamp ASC', [auctionId]);
    const mapped = messages.map(m => ({ ...m, isAnnouncement: m.isAnnouncement === 1 }));
    res.json({ success: true, messages: mapped });
});

// Socket.IO
io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join-auction', (auctionId) => {
        socket.join(`auction-${auctionId}`);
    });

    socket.on('send-message', async (payload) => {
        const { auctionId, userId, userName, role, text } = payload;
        if (!auctionId || !text || !text.trim()) return;

        const db = await getDb();
        const msg = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
            auctionId: parseInt(auctionId),
            userId,
            userName: userName || `User ${userId}`,
            role: role || 'user',
            text: text.trim(),
            isAnnouncement: role === 'admin' ? 1 : 0,
            timestamp: new Date().toISOString()
        };

        await db.run(
            'INSERT INTO chat_messages (id, auctionId, userId, userName, role, text, isAnnouncement, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [msg.id, msg.auctionId, msg.userId, msg.userName, msg.role, msg.text, msg.isAnnouncement, msg.timestamp]
        );

        io.to(`auction-${auctionId}`).emit('new-message', { ...msg, isAnnouncement: role === 'admin' });
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });
});

// --- Auction Finalization Job ---
setInterval(async () => {
    const db = await getDb();
    const auctions = await db.all('SELECT * FROM auctions WHERE finalized = 0');

    for (const auction of auctions) {
        const now = new Date();
        const status = getAuctionStatus(auction);

        // Notify ending soon
        if (status === 'active') {
            const timeRemaining = new Date(auction.endTime) - now;
            if (timeRemaining > 0 && timeRemaining <= 60 * 60 * 1000 && !auction.notifiedEndingSoon) {
                await db.run('UPDATE auctions SET notifiedEndingSoon = 1 WHERE id = ?', [auction.id]);
                const items = await db.all('SELECT * FROM items WHERE auctionId = ?', [auction.id]);
                const participantIds = new Set();
                for (const item of items) {
                    const bids = await db.all('SELECT DISTINCT userId FROM bids WHERE itemId = ?', [item.id]);
                    bids.forEach(b => participantIds.add(b.userId));
                }
                for (const userId of participantIds) {
                    await addNotification(db, userId, `Auction "${auction.title}" is ending soon!`, 'ending');
                }
                io.emit('notification-update');
            }
        }

        // Finalize ended auctions
        if (status === 'ended') {
            await db.run('UPDATE auctions SET finalized = 1 WHERE id = ?', [auction.id]);
            console.log(`Finalizing auction: ${auction.title}`);

            const items = await db.all('SELECT * FROM items WHERE auctionId = ?', [auction.id]);
            for (const item of items) {
                const winningBid = await db.get('SELECT * FROM bids WHERE itemId = ? ORDER BY id DESC LIMIT 1', [item.id]);
                if (winningBid) {
                    const winner = await db.get('SELECT * FROM users WHERE id = ?', [winningBid.userId]);
                    if (winner) {
                        const newBal = winner.kogbucks_balance - winningBid.amount;
                        const newHold = Math.max(0, (winner.kogbucks_on_hold || 0) - winningBid.amount);
                        await db.run('UPDATE users SET kogbucks_balance = ?, kogbucks_on_hold = ? WHERE id = ?', [newBal, newHold, winner.id]);
                        await addNotification(db, winner.id, `Congratulations! You won "${item.name}" for ${winningBid.amount} Kogbucks.`, 'won');
                        console.log(`Item sold! Deducted ${winningBid.amount} from user ${winner.id}`);
                    }
                }
            }
            io.emit('notification-update');
        }
    }
}, 5000);

// Initialize DB then start server
getDb().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
