const express = require("express");
const dotenv=require('dotenv')
const cors=require('cors')
const mongoose=require('mongoose')

dotenv.config();

const app = express();
app.use(cors());


const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
    console.log("Home Page");
    res.send("Welcome to the Event Booking Server!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});