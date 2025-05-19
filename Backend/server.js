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

const allowedOrigins = [
  'http://localhost:4200',
  'https://user-management-system-l1r3.onrender.com',
  'https://monreal-user-management-frontend.onrender.com'
];

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
const port = process.env.PORT || (process.env.NODE_ENV === 'production' ? 80 : 4000);
app.listen(port, () => console.log('Server listening on port ' + port));