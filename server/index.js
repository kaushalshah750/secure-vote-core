require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize, Voter, Candidate, Config } = require('./models/sql-models');
const { Op } = require('sequelize'); // Sequelize operators

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// --- HELPER: CHECK TIMER ---
async function checkElectionStatus() {
    let config = await Config.findOne({ where: { key: 'ELECTION_CONFIG' } });
    
    // First Run Setup
    if (!config) {
        const tomorrowSixPM = new Date();
        tomorrowSixPM.setDate(tomorrowSixPM.getDate() + 1);
        tomorrowSixPM.setHours(18, 0, 0, 0);
        config = await Config.create({ 
            key: 'ELECTION_CONFIG', 
            endTime: tomorrowSixPM 
        });
    }

    const now = new Date();
    if (now > config.endTime || !config.isActive) {
        return { isOpen: false, message: 'Voting has ended.' };
    }
    return { isOpen: true, endTime: config.endTime };
}

// --- PUBLIC ROUTES ---

// 1. Login (MySQL Version)
app.post('/api/login', async (req, res) => {
    try {
        const { phone, name } = req.body;
        const status = await checkElectionStatus();
        if (!status.isOpen) return res.status(403).json({ message: status.message });

        const voter = await Voter.findOne({ where: { phone } });
        
        if (!voter) return res.status(401).json({ message: 'Mobile number not found.' });

        // Name Match (Case Insensitive)
        if (voter.name.trim().toLowerCase() !== name.trim().toLowerCase()) {
            return res.status(401).json({ message: 'Name mismatch. Check spelling.' });
        }

        if (voter.hasVoted) return res.status(403).json({ message: 'Vote already recorded.' });

        res.json({ success: true, voterId: voter.id, name: voter.name, endTime: status.endTime });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login Error' });
    }
});

// 2. Get Candidates
app.get('/api/candidates', async (req, res) => {
    const candidates = await Candidate.findAll({
        attributes: ['id', 'name', 'party', 'photoUrl'] // Hiding voteCount
    });
    res.json(candidates);
});

// 3. Vote (Atomic MySQL Update)
app.post('/api/vote', async (req, res) => {
    try {
        const { voterId, candidateId } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        const status = await checkElectionStatus();
        if (!status.isOpen) return res.status(403).json({ message: 'Time Over' });

        // ATOMIC UPDATE: Only update if hasVoted is false
        const [updatedRows] = await Voter.update(
            { hasVoted: true, votedAt: new Date(), ipAddress: ip },
            { where: { id: voterId, hasVoted: false } }
        );

        if (updatedRows === 0) {
            return res.status(403).json({ message: 'Already Voted!' });
        }

        await Candidate.increment('voteCount', { where: { id: candidateId } });
        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Vote Failed' });
    }
});

// --- ADMIN ROUTES (NEW) ---
// Secure this with a hardcoded password for now
app.post('/api/admin/results', async (req, res) => {
    const { password } = req.body;
    if (password !== 'Admin@123') { // Simple protection
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const results = await Candidate.findAll({
        order: [['voteCount', 'DESC']]
    });
    
    const stats = {
        totalVoters: await Voter.count(),
        totalVoted: await Voter.count({ where: { hasVoted: true } })
    };

    res.json({ results, stats });
});

// DB Connect & Start
sequelize.authenticate()
    .then(() => {
        console.log('✅ MySQL Connected');
        app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));
    })
    .catch(err => console.error('❌ DB Error:', err));