'use strict';

const express = require('express');
const router = express.Router();

const query = require('./resolvers/Query');

router.use('/account',  require('./routes/account'));
router.use('/session',  require('./routes/session'));
router.use('/user',     require('./routes/user'));
router.use('/users',    require('./routes/users'));

// GET /heartbeat
router.get('/heartbeat', function(req, res) {
    console.log('GET /heartbeat'); // TODO: replace with actual logging

    const response = {
        name: 'tbd', // TODO: come up with a name for this thing
        vitals: {
            
        }
    }

    res.json(response);
});

// GET /me
router.get('/me', async function(req, res) {
    console.log('GET /me');
    let response;

    try {
        response = await query.retrieveUser(req.userId).$fragment(`
            {
                name
                email
            }
        `);
    } catch (error) {
        console.log('there was an error', error.message);
        res.status(400); // Bad Request
        response = error.message;
    }
    
    res.json(response);
})

module.exports = router;