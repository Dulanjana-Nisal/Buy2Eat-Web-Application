const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const connectDatabase = require('./databases/db');
const { PORT } = require('./config/env');
const errorHandlerMiddleware = require('./middleware/errorHandlerMiddleware');
const cookieParser = require("cookie-parser");

// import routers
const authRouter = require('./routes/authRouter');
const usersRouter = require('./routes/usersRouter');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

app.get('/', (_request, response) => {
  response.json({ message: 'Buy2Eat API is running' });
});

app.use('/api/v1/buy2eat/auth', authRouter);
app.use('/api/v1/buy2eat/users', usersRouter);
app.use(errorHandlerMiddleware);

async function startServer() {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error.message);
    process.exit(1);
  }
}

startServer();
