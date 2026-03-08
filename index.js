require("dotenv").config();

const express = require("express");

const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/order", orderRoutes);

app.listen(3000, () => {
    console.log("API running on port 3000");
});