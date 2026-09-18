require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Scan2Health backend is running',
  });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Server startup aborted because MongoDB could not connect.');
    process.exit(1);
  }
};

startServer();
