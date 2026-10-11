const express = require("express");
const dotenv=require('dotenv')
const cors=require('cors')
const mongoose=require('mongoose')
const authRouters=require("./routes/auth.js");


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());



//Routes
app.use("/api/auth", authRouters);


const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
    console.log("Home Page");
    res.send("Welcome to the Event Booking Server!");
});


mongoose.connect(process.env.MONGODB_URI, {

})
.then(() => {
    console.log("Connected to MongoDB");
})
.catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});