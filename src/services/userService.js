const { sql } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_kernel_of_self_dev';

async function createUser(email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const { rows } = await sql`
            INSERT INTO users (email, password_hash)
            VALUES (${email}, ${hashedPassword})
            RETURNING id, email, created_at;
        `;
        return rows[0];
    } catch (error) {
        if (error.code === '23505') {
            throw new Error('User already exists');
        }
        throw error;
    }
}

async function findUserByEmail(email) {
    const { rows } = await sql`
        SELECT * FROM users WHERE email = ${email};
    `;
    return rows[0];
}

async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '30d' }
    );
}

module.exports = {
    createUser,
    findUserByEmail,
    verifyPassword,
    generateToken,
    JWT_SECRET
};
