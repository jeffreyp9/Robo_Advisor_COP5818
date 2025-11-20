// Jeffrey Potvin, Krishana Thapa, Alexey Akopov
// Final Project
// COP 5818
// PIDs: 5066496, 5663249, 5013953

// Jeffrey Potvin, Krishana Thapa, Alexey Akopov
// Script to seed SSA Data from JSON file into MongoDB
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const LifeExpectancy = require('../models/LifeExpectancy');

dotenv.config(); // Load MONGO_URI from .env

const seedData = async () => {
  try {
    // Connect to mongoDB 
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB...');

    // Read the .json data
    const dataPath = path.join(__dirname, 'ssa_table.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const ssaData = JSON.parse(rawData);

    // Make sure we dont have duplicate data
    await LifeExpectancy.deleteMany({});
    console.log('Cleared existing life expectancy data.');

    // Insert the new data into the database
    await LifeExpectancy.insertMany(ssaData);
    console.log(`Successfully seeded ${ssaData.length} records.`);

    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();