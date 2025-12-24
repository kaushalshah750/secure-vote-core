# Secure Vote Core 🗳️

**Version:** 1.0.0  
**Status:** In Development  
**Agency:** Sparqal (Kaushal Shah)

## 📖 Overview
Secure Vote Core is a high-integrity, anonymous digital voting platform designed for closed-group elections. It features a "Zero-Trust" authentication model where voter eligibility is verified against a pre-authorized database without storing voting patterns linked to identities.

## 🚀 Key Features
- **Isolated Authentication:** Voter identity is verified separately from the ballot casting process.
- **One-Person-One-Vote:** Atomic database transactions prevent double voting.
- **Real-Time Integrity:** Live counting dashboard for election officials.
- **Responsive UI:** Angular v19 frontend optimized for mobile voting.

## 🛠️ Tech Stack
- **Frontend:** Angular v19, Tailwind CSS v4
- **Backend:** Node.js, Express.js (Helmet secured)
- **Database:** MongoDB (ACID Compliant Transactions)
- **Infrastructure:** AWS EC2 + Nginx Reverse Proxy

## 📂 Project Structure
- `/client`: Angular Frontend Application
- `/server`: Node.js API Service

## 🚦 Local Development

### Prerequisites
- Node.js v20+
- MongoDB Local or Atlas URI

### Installation
1. **Clone the repo:**
   ```bash
   git clone <repo_url>
   ```
2. **Backend Setup:**

   ```bash
    cd server
    npm install
    cp .env.example .env
    npm start
   ```
3. **Frontend Setup:**

   ```bash
cd client
npm install
ng serve
   ```

##🔒 Security Protocols
This system implements strict CORS policies, Rate Limiting, and Input Sanitization to prevent manipulation during the voting window.

© 2025 Kaushal Shah. All Rights Reserved.