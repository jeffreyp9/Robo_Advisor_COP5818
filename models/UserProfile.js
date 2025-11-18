// Jeffrey Potvin, Krishana Thapa, Alexey Akopov
// Final Project
// COP 5818
// PIDs: 5066496, 5663249, 5013953

// import mongoose
const mongoose = require('mongoose');


// Define the schema for user profile data
const userProfileSchema = new mongoose.Schema({
  // required personal information
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  // age information
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 100
  },
  // retirement age information
  retirementAge: {
    type: Number,
    required: true,
    min: 50,
    max: 80
  },
  
  // gender information
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female']
  },
  
  // Financial information
  income: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Family information
  maritalStatus: {
    type: String,
    required: true,
    enum: ['single', 'married', 'divorced', 'widowed']
  },
  spouseIncome: {
    type: Number,
    default: 0,
    min: 0
  },
  kids: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Asset information
  homeowner: {
    type: Boolean,
    default: false
  },
  significantDebt: {
    type: Boolean,
    default: false
  },
  
  // Calculated results
  lifeExpectancy: {
    type: Number,
    required: true
  },
  investmentHorizon: {
    type: Number,
    required: true
  },
  riskLevel: {
    type: String,
    required: true,
    enum: ['Conservative', 'Moderate', 'Aggressive']
  },
  equityPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  fixedIncomePercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Added an index here for faster queries on email
// this is useful in mongodb to quickly find user profiles by email
// instead of painstakingly searching through all documents
userProfileSchema.index({ email: 1 });

module.exports = mongoose.model('UserProfile', userProfileSchema);
