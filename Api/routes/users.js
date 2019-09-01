const express = require('express');
const router = express.Router();

const { handleError, hasPermission, slimUser, verifyLoggedIn } = require('../utils');
const query = require('../resolvers/Query');

// all routes in this file begin with /users

// all routes below require login
router.use((req, res, next) => verifyLoggedIn(req, res, next));

// GET /users
router.get('/', async function (req, res) {
    console.log('GET /users');
    let response;

    try {
        hasPermission(req.user, ['ADMIN']);
        response = await query.retrieveUsers(req.userId).$fragment(slimUser);
    } catch (error) {
        response = handleError(error);
        res.status(400);  // bad request
    }
    
    res.json(response);
});

module.exports = router;