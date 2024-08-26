const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
dotenv.config();
const Port = process.env.PORT || 8000;

const userRoutes = require("./routes/user");
const quizRoutes = require("./routes/quiz");

const app = express();

// Enable Cors
app.use(cors());
app.use(morgan("combined"));

//Middleware bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Register Route
app.use(
	"/api/user",
	async () => {
		await connectDb();
	},
	userRoutes
);
app.use(
	"/api/quiz",
	async () => {
		await connectDb();
	},
	quizRoutes
);
app.get("*", async (req, res) => {
	await connectDb();
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

let mongo_instance = null;

const connectDb = async () => {
	try {
		if (mongo_instance) return mongo_instance;
		mongo_instance = await mongoose.connect(process.env.MONGODB_URL);
		console.log(`database connection successfully`);
		return mongo_instance;
	} catch (error) {
		console.error(`Failed to connect to the database: ${error.message}`);
		return null;
	}
};

connectDb().then(() => {
	app.listen(Port, () => {
		console.log("server is running on port ", Port);
	});
});
