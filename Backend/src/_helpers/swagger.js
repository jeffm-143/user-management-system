const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const swaggerDocument = YAML.load('./swagger.yaml');

function sanitizeRoutes(doc) {
    // Process any URLs that might be incorrectly used
    if (doc && doc.servers) {
        doc.servers = doc.servers.map(server => {
            // Make sure the URL isn't being used directly as a route path
            if (server.url && server.url.startsWith('http')) {
                // Keep the URL for display purposes but don't use it as a route path
                server._url = server.url;
                server.url = '/api'; // Replace with a proper path segment
            }
            return server;
        });
    }
    return doc;
}


router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = router;