const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const authRouters = require('./routes/auth.js');
const eventsRoutes = require('./routes/events.js');
const bookingsRoutes = require('./routes/bookings.js');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouters);
app.use('/api/events', eventsRoutes);
app.use('/api/bookings', bookingsRoutes);


const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
    console.log("Home Page");
    res.send("Welcome to the Event Booking Server!");
});


mongoose.connect(process.env.MONGODB_URI, {})
.then(async () => {
    console.log("Connected to MongoDB");

    try {
        const indexes = await mongoose.connection.db.collection('users').indexes();
        const hasNameIndex = indexes.some((index) => index.key && index.key.name === 1);

        if (hasNameIndex) {
            await mongoose.connection.db.collection('users').dropIndex('name_1');
            console.log('Dropped stale unique index on users.name');
        }
    } catch (error) {
        console.warn('Index cleanup skipped:', error.message);
    }
})
.catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});