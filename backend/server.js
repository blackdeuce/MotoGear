require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error("JWT_SECRET must be set in .env and contain at least 32 characters.");
    process.exit(1);
}

const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://127.0.0.1:5500";

app.use(helmet());
app.use(cors({
    origin: allowedOrigin,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "10kb" }));

app.get("/", (req, res) => {
    res.json({ message: "MotoGear backend is running!" });
});

app.get("/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        res.status(200).json({ status: "ok", database: "connected" });
    } catch (error) {
        console.error("Health check database error:", error.message);
        res.status(503).json({ status: "error", database: "unavailable" });
    }
});

app.use("/api/auth", authRoutes);

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
    console.error("Unhandled server error:", err);
    res.status(500).json({ message: "Internal server error" });
});

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
    console.log(`MotoGear API listening on http://localhost:${PORT}`);
});

async function shutdown() {
    console.log("Shutting down MotoGear API...");
    server.close(async () => {
        await pool.end();
        process.exit(0);
    });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
