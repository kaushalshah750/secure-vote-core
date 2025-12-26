const mongoose = require('mongoose');

// 1. Candidate Schema (No Change)
const CandidateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    party: { type: String, default: 'Independent' },
    photoUrl: { type: String, default: 'assets/default-candidate.png' },
    voteCount: { type: Number, default: 0 }
});

// 2. Voter Schema (UPDATED: PIN Removed, Name Required)
const VoterSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    name: { type: String, required: true }, // Name ab authentication key hai
    hasVoted: { type: Boolean, default: false },
    votedAt: { type: Date },
    ipAddress: { type: String }
});

// 3. Config Schema (No Change)
const ConfigSchema = new mongoose.Schema({
    key: { type: String, unique: true },
    endTime: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
});

const Candidate = mongoose.model('Candidate', CandidateSchema);
const Voter = mongoose.model('Voter', VoterSchema);
const Config = mongoose.model('Config', ConfigSchema);

module.exports = { Candidate, Voter, Config };