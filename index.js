require("dotenv").config();

const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(express.json());

// Swagger documentation
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Jitterbit Case API Documentation"
}));

app.use("/auth", authRoutes);
app.use("/order", orderRoutes);

app.use(errorHandler);

app.listen(3000, () => {
    console.log("API running on port 3000");
    console.log("Swagger documentation available at http://localhost:3000/docs");
});