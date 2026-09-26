require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const profileRoutes = require('./routes/profileRoutes');
const healthConditionRoutes = require("./routes/healthConditionRoutes");
const nutritionalRuleRoutes = require('./routes/nutritionalRuleRoutes');

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

app.use('/api/profile', profileRoutes);


app.use(
  "/api/health-conditions",
  healthConditionRoutes
);

app.use(
  '/api/nutritional-rules',
  nutritionalRuleRoutes
);

app.use((error, req, res, next) => {
  console.error('Unhandled API error:', error);
  res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
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

if (require.main === module) startServer();

module.exports = app;
