require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Candidate, Voter, Config } = require('./models/schemas');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());
app.use(cors()); // Production mein isko restrict karenge
app.use(express.json());
app.use(morgan('dev')); // Logs requests

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/secure_vote_db')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ DB Error:', err));

// --- HELPER FUNCTIONS ---

// Check if Election is Active
async function checkElectionStatus() {
    // Default: Ends 24 hours from now if not set
    let config = await Config.findOne({ key: 'ELECTION_CONFIG' });
    if (!config) {
        // First run setup (Auto-create 6 PM deadline for testing)
        const tomorrowSixPM = new Date();
        tomorrowSixPM.setHours(18, 0, 0, 0); 
        config = await Config.create({ 
            key: 'ELECTION_CONFIG', 
            endTime: tomorrowSixPM,
            isActive: true 
        });
    }
    
    const now = new Date();
    if (now > config.endTime || !config.isActive) {
        return { isOpen: false, message: 'Voting has ended.' };
    }
    return { isOpen: true, endTime: config.endTime };
}

// --- API ROUTES ---

// 1. Login (Phone + PIN)
app.post('/api/login', async (req, res) => {
    try {
        const { phone, name } = req.body;

        // Check Timer
        const status = await checkElectionStatus();
        if (!status.isOpen) return res.status(403).json({ message: status.message });

        // Step 1: Phone number se user dhoondo
        const voter = await Voter.findOne({ phone });
        
        if (!voter) {
            return res.status(401).json({ message: 'Mobile number not found in list.' });
        }

        // Step 2: Name Match (Case Insensitive)
        // User "rahul" likhe aur DB mein "RAHUL" ho toh bhi chalna chahiye
        const dbName = voter.name.trim().toLowerCase();
        const inputName = name.trim().toLowerCase();

        if (dbName !== inputName) {
            return res.status(401).json({ 
                message: 'Name does not match our records. Please enter exact full name.' 
            });
        }

        if (voter.hasVoted) {
            return res.status(403).json({ 
                message: `Vote already recorded for ${voter.name}` 
            });
        }

        // Success
        res.json({ 
            success: true, 
            voterId: voter._id, 
            name: voter.name,
            endTime: status.endTime 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// 2. Get Candidates (Secure List)
app.get('/api/candidates', async (req, res) => {
    try {
        // Sirf Name aur Photo bhejenge, Vote Count NAHI
        const candidates = await Candidate.find({}, 'name party photoUrl');
        res.json(candidates);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// 3. CAST VOTE (Simplified & Fixed for Localhost)
app.post('/api/vote', async (req, res) => {
    try {
        const { voterId, candidateId } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // 1. Check Timer
        const status = await checkElectionStatus();
        if (!status.isOpen) {
            return res.status(403).json({ message: 'Voting Time Over!' });
        }

        // 2. ATOMIC LOCK: Try to find AND update the voter in one shot.
        // Condition: ID match hona chahiye AUR hasVoted FALSE hona chahiye.
        // Agar hasVoted pehle se TRUE hai, toh ye 'null' return karega.
        const voter = await Voter.findOneAndUpdate(
            { _id: voterId, hasVoted: false }, // <--- Critical Security Check
            { 
                $set: { 
                    hasVoted: true, 
                    votedAt: new Date(), 
                    ipAddress: ip 
                } 
            },
            { new: true } // Returns the updated document
        );

        // Agar voter null mila, iska matlab usne pehle hi vote de diya tha (Race condition handled)
        if (!voter) {
            return res.status(403).json({ message: 'Fraud Detected: Vote already recorded.' });
        }

        // 3. Increment Candidate Count
        // (Voter mark ho chuka hai, ab candidate count badha do)
        await Candidate.findByIdAndUpdate(candidateId, { $inc: { voteCount: 1 } });

        res.json({ success: true, message: 'Vote Secured.' });

    } catch (err) {
        console.error('Vote Error:', err);
        // Agar Candidate update fail hua toh log kar lo, but voter mark ho chuka hai to double vote nahi hoga
        res.status(500).json({ message: 'Server Error during voting.' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Secure Vote Engine running on Port ${PORT}`);
});