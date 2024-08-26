require("dotenv").config();
const mongoose = require("mongoose");

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

module.exports = connectDb;
