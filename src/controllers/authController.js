const { createUser, findUserByEmail, verifyPassword, generateToken } = require('../services/userService');

async function register(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    try {
        const user = await createUser(email, password);
        const token = generateToken(user);
        res.status(201).json({ user, token });
    } catch (error) {
        if (error.message === 'User already exists') {
            return res.status(409).json({ error: 'User already exists' });
        }
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
    }
}

async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    try {
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await verifyPassword(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user);
        res.json({ user: { id: user.id, email: user.email }, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
}

module.exports = { register, login };
