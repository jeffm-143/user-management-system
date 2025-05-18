const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const errorHandler = require('./src/_middleware/error-handler');

const app = express();

// CORS middleware
app.use(cors({
    origin: function(origin, callback) {
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'https://4200-firebase-user-management-system-1747518362589.cluster-zumahodzirciuujpqvsniawo3o.cloudworkstations.dev',
            'http://localhost:4200',
            'https://user-management-system-zn2z.onrender.com'
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('Origin not allowed by CORS:', origin);
            callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.options('*', cors());

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// API routes
app.use('/accounts', require('./src/_accounts/accounts.controller'));
app.use('/api-docs', require('./src/_helpers/swagger'));
app.use('/departments', require('./src/departments'));
app.use('/employees', require('./src/employees'));
app.use('/requests', require('./src/request'));
app.use('/workflows', require('./src/workflows'));

// Serve static files
app.use(express.static(path.join(__dirname, '../Frontend/src')));

// Handle Angular routing
app.get('*', (req, res) => {
    if (req.path === '/') {
        res.redirect('/account/login');
    } else {
        res.sendFile(path.join(__dirname, '../Frontend/src/index.html'));
    }
});

// Global error handler
app.use(errorHandler);

// Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log('Server listening on port ' + port);
});