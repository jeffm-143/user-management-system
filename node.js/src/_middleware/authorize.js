const { expressjwt: jwt } = require('express-jwt');
const { secret } = require('config.json');
const db = require('../_helpers/db');

module.exports = authorize;

function authorize(roles = []) {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        // JWT middleware to validate token and populate req.user
        jwt({ secret, algorithms: ['HS256'], requestProperty: 'user' }),

        // Custom authorization middleware
        async (req, res, next) => {
            console.log(req.user); // Debugging line: Check if req.user is populated

            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized, user not found in token' });
            }

            const account = await db.Account.findByPk(req.user.id);

            if (!account || (roles.length && !roles.includes(account.role))) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            req.user.role = account.role;
            const refreshTokens = await account.getRefreshTokens();
            req.user.ownsToken = token => !!refreshTokens.find(x => x.token === token);
            next();
        }
    ];
}