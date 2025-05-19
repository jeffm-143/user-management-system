require('rootpath')();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('./src/_middleware/error-handler');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());


const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:4200', 'https://monreal-user-management-frontend.onrender.com'];

const corsOptions = {
  origin: function(origin, callback) {
    console.log(`Request from origin: ${origin}`);
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      console.log(`CORS allowed for origin: ${origin}`);
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization,X-Requested-With,Accept'
};

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.get('/', (req, res) => {
  res.json({
    message: 'User Management System API',
    version: '1.0',
    status: 'running',
    documentation: '/api-docs'
  });
});

// allow cors requests from any origin and with credentials
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

// api routes
app.use('/accounts', require('./src/_accounts/accounts.controller'));

// swagger docs route
app.use('/api-docs', require('./src/_helpers/swagger'));

// departments routes
app.use('/departments', require('./src/departments'));

// employees routes
app.use('/employees', require('./src/employees'));

// requests routes
app.use('/requests', require('./src/request'));

// workflows routes
app.use('/workflows', require('./src/workflows'));

// global error handler
app.use(errorHandler);

// start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, () => {
  console.log('===== SERVER STARTED =====');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Allowed origins:', allowedOrigins);
  if (process.env.NODE_ENV === 'production') {
    console.log('Angular path:', path.join(__dirname, 'public'));
    // Check if index.html exists
    try {
      const indexPath = path.join(__dirname, 'public', 'index.html');
      if (require('fs').existsSync(indexPath)) {
        console.log('index.html found!');
      } else {
        console.log('WARNING: index.html not found in public folder');
      }
    } catch (error) {
      console.error('Error checking for index.html:', error.message);
    }
  }
  console.log('Server listening on port ' + port);
});
