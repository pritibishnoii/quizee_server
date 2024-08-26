const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const userRoutes = require("./routes/user");
const quizRoutes = require("./routes/quiz");

const app = express();

// Enable Cors
// app.use(cors());
app.use(
	cors({
		origin: "*", // Allow requests from this origin
	})
);

//Middleware bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Register Route
app.use("/api/user", userRoutes);
app.use("/api/quiz", quizRoutes);
app.get("/", async (req, res) => {
	res.status(200).json({
		message: "Server is up and running",
		createdAt: new Date().toISOString(),
	});
});

// Error handler middleware
app.use((err, req, res, next) => {
	console.log(err.stack);
	res.status(500).json({ error: "Internal server Error" });
});

const Port = process.env.PORT || 8000;
app.listen(Port, () => {
	mongoose
		.connect(process.env.MONGODB_URL)
		.then(() =>
			console.log(
				`Server is running  on http://localhost:${Port} database connection successfully`
			)
		)
		.catch((error) => console.log(error));
});
