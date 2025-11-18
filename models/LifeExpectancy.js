// Jeffrey Potvin, Krishana Thapa, Alexey Akopov
// Final Project
// COP 5818
// PIDs: 5066496, 5663249, 5013953

// import mongoose
const mongoose = require('mongoose');


// Define the schema for life expectancy data
const lifeExpectancySchema = new mongoose.Schema({
  age: { type: Number, required: true, unique: true },
  male: { type: Number, required: true },
  female: { type: Number, required: true }
});

// Export the LifeExpectancy model
module.exports = mongoose.model('LifeExpectancy', lifeExpectancySchema);