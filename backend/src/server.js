
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;

// Middleware to parse JSON bodies
app.use(express.json());

// Default Route
app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to the backend server!" });
}); 

// Home Route
app.get("/home", (req, res) => {
    res.status(200).json({ message: "Hello World!" });
});

// Health Check Route
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});