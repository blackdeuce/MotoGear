const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BCRYPT_ROUNDS = 12;
const MAX_PASSWORD_LENGTH = 72;

// POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!EMAIL_PATTERN.test(normalizedEmail) || normalizedEmail.length > 254) {
            return res.status(400).json({ message: "Please enter a valid email." });
        }

        if (password.length < 8 || password.length > MAX_PASSWORD_LENGTH) {
            return res.status(400).json({
                message: "Password must be between 8 and 72 characters."
            });
        }

        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

        const result = await pool.query(
            `INSERT INTO users (email, password_hash)
             VALUES ($1, $2)
             ON CONFLICT (email) DO NOTHING
             RETURNING id, email, created_at`,
            [normalizedEmail, passwordHash]
        );

        if (result.rowCount === 0) {
            return res.status(409).json({ message: "Email is already registered." });
        }

        return res.status(201).json({
            message: "Registration successful.",
            user: result.rows[0]
        });
    } catch (error) {
        console.error("Registration error:", error.message);
        return res.status(500).json({ message: "Unable to register right now." });
    }
};

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (typeof email !== "string" || typeof password !== "string" ||
            !email.trim() || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const result = await pool.query(
            `SELECT id, email, password_hash, created_at
             FROM users
             WHERE email = $1`,
            [normalizedEmail]
        );

        if (result.rowCount === 0) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const user = result.rows[0];
        const passwordMatches = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatches) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: "Login successful.",
            token,
            expiresIn: 3600,
            user: {
                id: user.id,
                email: user.email,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error("Login error:", error.message);
        return res.status(500).json({ message: "Unable to log in right now." });
    }
};
