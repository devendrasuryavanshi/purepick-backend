const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const User = require('./models/user');
const { detectText, detectWeb } = require('./extract-data');
const { analyze } = require('./analyse');


// if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
//     console.error('Error: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.');
//     process.exit(1);
// } else {
//     console.log('GOOGLE_APPLICATION_CREDENTIALS environment variable is set.');
// }

const dbUrl = "mongodb://127.0.0.1:27017/purepick";

// Connect to MongoDB
async function connectToMongoDB() {
    try {
        await mongoose.connect(dbUrl); // Establish MongoDB connection
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
}

const app = express();
const port = 8000;

// Enable CORS
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
}));

// Define a simple route
app.get('/', (req, res) => {
    res.json({ msg: 'hello world' });
});

const server = http.createServer(app);
const io = new Server(server, {
    maxHttpBufferSize: 5 * 1024 * 1024, // 5MB
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    }
});

app.get('/analyze', async (req, res) => {
    try {
        const result = await detectText("C:/Users/deven/Programming/Hackathons/Gemini API Developer Competition/PurePick/purepick-backend/tmp/upload/71sHxJTkBDL._SL1500_.jpg");
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: 'An error occurred while processing the image.' });
    }
});


io.on('connection', (socket) => {
    let userId = null;
    console.log('Socket connected:', socket.id);

    socket.on('user-auth', async (data, callback) => {
        try {
            const user = await User.findById(data.id);
            if (user) {
                userId = data.id;
                callback({ authenticated: true });
            } else {
                callback({ authenticated: false });
            }
        } catch (error) {
            callback({ authenticated: null });
        }
    });

    socket.on("upload", async (data, callback) => {
        if (!userId) {
            callback({ isSuccess: false, message: "User not authenticated" });
            return;
        }
        callback({ isSuccess: true, message: "Images processed successfully"});
        try {
            await analyze(data, socket);
        } catch (error) {
            console.log(error);
            callback({ isSuccess: false, message: "There was an error processing the images" });
        }
    });
    

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });
});

connectToMongoDB().then(() => {
    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});
