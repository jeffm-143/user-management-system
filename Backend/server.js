require('rootpath')();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('./src/_middleware/error-handler');
const path = require('path');


app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://4200-firebase-user-management-system-1747518362589.cluster-zumahodzirciuujpqvsniawo3o.cloudworkstations.dev',
      'http://localhost:4200'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Origin not allowed by CORS:', origin);
      callback(null, true); // In development, allow all origins
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

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

app.use(express.static(path.join(__dirname, '../Frontend/dist/angular-signup-verification-boilerplate')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/dist/angular-signup-verification-boilerplate/index.html'));
});

// global error handler
app.use(errorHandler);

// start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, () => console.log('Server listening on port ' + port));
