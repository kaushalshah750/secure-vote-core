const { Sequelize, DataTypes } = require('sequelize');

// ✅ TERA DATABASE CONNECTION (Localhost)
const sequelize = new Sequelize('secure_vote_db', 'root', 'Kaushal$#@#123', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false // Console ganda nahi hoga
});

// 1. VOTER MODEL
const Voter = sequelize.define('Voter', {
    phone: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        unique: true 
    },
    name: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    hasVoted: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: false 
    },
    votedAt: { 
        type: DataTypes.DATE 
    },
    ipAddress: { 
        type: DataTypes.STRING 
    }
});

// 2. CANDIDATE MODEL
const Candidate = sequelize.define('Candidate', {
    name: { type: DataTypes.STRING, allowNull: false },
    party: { type: DataTypes.STRING, defaultValue: 'Independent' },
    photoUrl: { type: DataTypes.STRING },
    voteCount: { type: DataTypes.INTEGER, defaultValue: 0 }
});

// 3. CONFIG MODEL (Timer)
const Config = sequelize.define('Config', {
    key: { type: DataTypes.STRING, unique: true },
    endTime: { type: DataTypes.DATE },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

module.exports = { sequelize, Voter, Candidate, Config };