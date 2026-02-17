# 🧠 Kernel of Self (k-self)

> *"Optimizing the human core, one commit at a time."*

[![Node.js](https://img.shields.io/badge/Runtime-Node.js-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Framework](https://img.shields.io/badge/Framework-Express-lightgrey?style=flat-square&logo=express)](https://expressjs.com/)
[![AI](https://img.shields.io/badge/AI-Groq-orange?style=flat-square)](https://groq.com/)
[![Notifications](https://img.shields.io/badge/Notifications-ntfy.sh-blue?style=flat-square)](https://ntfy.sh/)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

---

## 📖 Overview

**Kernel of Self** is a digital nervous system designed to resynchronize your mind and body. It leverages the speed of **Groq** AI to generate daily philosophical resilience updates and delivers them directly to your phone via **ntfy.sh**, ensuring you start your day with purpose and clarity.

## ⚡ The "Empire" Stack

This project uses a lightweight, high-performance stack designed for minimal cognitive load:

| Component | Technology | Why? |
|-----------|------------|------|
| **Core** | `Node.js` + `Express` | You already speak this language. Zero learning curve. |
| **Intelligence** | `Groq SDK` | Near-instant inference for generating daily wisdom. |
| **Alerts** | `ntfy.sh` | Simple HTTP-based push notifications. No complex Firebase setup. |
| **Automation** | `Vercel Cron` | Serverless scheduling. It wakes up so you don't have to. |

---

## 🚀 Getting Started

### 1. Initialize the Core
Clone the repository and install the dependencies:

```bash
git clone https://github.com/yourusername/Kernel-of-Self.git
cd Kernel-of-Self
npm install
```

### 2. Configure Environment variables
Create your `.env` file from the example:

```bash
cp .env.example .env
```

Fill in your secrets:
- `GROQ_API_KEY`: Your key from [Groq Console](https://console.groq.com).
- `NTFY_TOPIC`: Your unique topic (e.g., `k-self-protocol`).
- `NTFY_URL`: Defaults to `https://ntfy.sh`.

### 3. Run Locally
Ignite the kernel on your local machine:

```bash
npm start
```

Trigger a manual synchronization (notification test):
```bash
curl http://localhost:3000/api/wakeup
```

---

## ☁️ Deployment

Deploy seamlessly to **Vercel**:

1.  Push to GitHub.
2.  Import project into Vercel.
3.  Add Environment Variables in Vercel.
4.  **Done.** The `vercel.json` automatically schedules the daily wake-up call at **8:00 AM**.

---

## 🛡️ License

Private Kernel. Optimized for personal use.
