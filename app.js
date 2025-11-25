// Jeffrey Potvin, Krishana Thapa, Alexey Akopov
// Final Project
// COP 5818
// PIDs: 5066496, 5663249, 5013953


// import required modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// imoort the advisor routes
const advisorRoutes = require('./routes/advisorRoutes');

// load the environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// middleware for handling requests
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// use static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// use advisor routes
app.use('/api', advisorRoutes);

// serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// error handler for the frontend in case of errors 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// start the server
app.listen(PORT, () => {
  console.log(`Robo Advisor server running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});