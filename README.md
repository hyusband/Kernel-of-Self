# 🧠 Kernel of Self (k-self)

> *"Optimizing the human core, one commit at a time."*

[![Node.js](https://img.shields.io/badge/Runtime-Node.js-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Framework](https://img.shields.io/badge/Framework-Next.js-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![AI](https://img.shields.io/badge/AI-Groq-orange?style=flat-square)](https://groq.com/)
[![Database](https://img.shields.io/badge/DB-PostgreSQL-blue?style=flat-square&logo=postgresql)](https://vercel.com/postgres)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

---

## 📖 Overview

**Kernel of Self** is a digital nervous system designed to resynchronize your mind and body. It serves as a personal operating system that:
1.  **Tracks** your cognitive and biological states (Mood, Sleep).
2.  **Analyzes** your patterns using the **Groq** AI engine.
3.  **Secures** your deepest thoughts with **Zero-Knowledge Encryption**.
4.  **Synthesizes** daily philosophical resilience updates delivered via **ntfy.sh**.

## ⚡ The "Empire" Stack

Built for speed, privacy, and resilience:

| Component | Technology | Role |
|-----------|------------|------|
| **Core** | `Next.js` + `Node.js` | Hybrid frontend/backend architecture. |
| **Intelligence** | `Groq SDK` + `Llama 3` | Near-instant inference for RAG and Analysis. |
| **Memory** | `PostgreSQL` + `pgvector` | Vector database for semantic recall. |
| **Security** | `Web Crypto API` (AES-GCM) | Client-side encryption ("The Vault"). |
| **Communication** | `ntfy.sh` | Privacy-focused push notifications. |

---

## 🗝️ Key Systems

### 1. The Dashboard (Mental Cockpit)
A minimalist, terminal-inspired interface to input your state.
- **Mood Tracking**: 1-10 slider with granular note taking.
- **Multi-User**: Isolated data for distinct "Egos".

### 2. The Vault (Zero-Knowledge)
*Your thoughts are yours alone.*
- **Client-Side Encryption**: Notes marked as "Vault" are encrypted in your browser using **PBKDF2** and **AES-GCM** before ever touching the server.
- **No Backdoor**: The server stores only the ciphertext. Without your password, the data is just random noise.

### 3. The Oracle (RAG AI)
*Chat with your past self.*
- **Retrieval Augmented Generation**: The Oracle enables you to chat with your historical data.
- **Contextual Awareness**: It recalls past moods and notes to give relevant advice.
- **Bilingual**: Fluent in English and Spanish.

### 4. The Diary (Cognitive Archives)
- **Timeline**: Chronological view of all your states.
- **AI Analysis**: On-demand analysis of your visible entries to generate tactical advice for improved resilience.

---

## 🚀 Getting Started

### 1. Initialize the Core
Clone the repository and install the dependencies:

```bash
git clone https://github.com/yourusername/Kernel-of-Self.git
cd Kernel-of-Self
npm install
cd dashboard && npm install
```

### 2. Configure Environment variables
Create your `.env` file from the example:

```bash
cp .env.example .env
```

Required secrets:
- `GROQ_API_KEY`: Your key from [Groq Console](https://console.groq.com).
- `POSTGRES_URL`: Connection string for Vercel/Neon Postgres.
- `JWT_SECRET`: Secret for session management.
- `ENCRYPTION_KEY`: 32-byte hex key for server-side encryption (standard notes).

### 3. Run Locally

**Backend (API & Cron):**
```bash
npm run dev
```

**Frontend (Dashboard):**
```bash
cd dashboard
npm run dev
```

Visit `http://localhost:3001` to access the interface.

---

## ☁️ Deployment

Deploy seamlessly to **Vercel**:

1.  Push to GitHub.
2.  Import project into Vercel.
3.  Add Environment Variables in Vercel.
4.  **Done.** The system is live.

---

## 🛡️ License

Private Kernel. Optimized for personal use.
