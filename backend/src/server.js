require('dotenv').config();

const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const connectDatabase = require('./config/db');
const healthRoutes = require('./routes/healthRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_request, response) => {
  response.json({ message: 'Buy2Eat API is running' });
});

app.use('/api/health', healthRoutes);

async function startServer() {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`Backend listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error.message);
    process.exit(1);
  }
}

startServer();
