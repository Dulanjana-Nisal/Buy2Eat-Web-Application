const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const helmet = require("helmet");
const connectDatabase = require('./databases/db');
const { PORT, CLIENT_URL, NODE_ENV } = require('./config/env');
const cookieParser = require("cookie-parser");

// check application environment
const isProduction = (NODE_ENV === 'development') ? false : true;

// middlewares
const errorHandlerMiddleware = require('./errors/errorHandlerMiddleware');
const requestIDMiddleware = require('./middleware/requestIDMiddleware');

// import routers
const authRouter = require('./routes/authRouter');
const usersRouter = require('./routes/usersRouter');
const customerRouter = require('./routes/customerRouter');

// create app
const app = express();

// hide technology information
app.disable("x-powered-by");

// security middlewares
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", process.env.API_URL || ""].filter(Boolean),
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'same-origin' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    strictTransportSecurity: isProduction ? {
      maxAge: 31536000,
      includeSubDomains: false,
      preload: false,
    } : false,
    frameguard: { action: 'deny' },
    noSniff: true,
  })
);

// middlewares
app.use(cors({
  origin: CLIENT_URL || "http://localhost:5173/",
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

app.get('/', (_request, response) => {
  response.json({ message: 'Buy2Eat API is running' });
});

// routers
app.use(requestIDMiddleware);
app.use('/api');
app.use('/api/v1/buy2eat/auth', authRouter);
app.use('/api/v1/buy2eat/customers', customerRouter);
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
