const express = require('express');
const router = express.Router();
const { handleError, signInUser, slimUser } = require('../utils');
const mutation = require('../resolvers/Mutation');

// all routes in this file begin with /account

router.use(express.json());

// POST /account/signup
router.post('/signup', async function(req, res) {
    console.log('POST /account/signup');
    console.log('body:', req.body);
    let args = req.body;
    let response;

    try {
        const user = await mutation.signup(args);
        signInUser(user.id, res);
        res.status(201);  // Created
        response = { message: "success" };
    } catch (error) {
        response = handleError(error);
        res.status(400); // Bad Request
    }

    res.json(response);
});

// POST /account/signin
router.post('/signin', async function(req, res) {
    console.log('POST /account/signin');
    console.log('body', req.body);
    let args = req.body;
    let response;

    try {
        const user = await mutation.signin(args);
        signInUser(user.id, res);
        response = { message: "success" };
    } catch (error) {
        response = handleError(error);
        res.status(400); // Bad Request
    }

    res.json(response);
});

// POST /account/signout
router.post('/signout', function(req, res) {
    console.log('POST /account/signout');
    console.log('body', req.body);

    res.clearCookie('token');
    res.json({
        message: 'Goodbye!'
    });
});

// POST /account/requestreset
router.post('/requestreset', async function(req, res) {
    console.log('POST /account/requestReset');
    console.log('email:', req.body.email);
    let response;

    try {
        response = await mutation.requestReset(req.body.email);
    } catch (error) {
        reponse = handleError(error);
        res.status(400);  // bad request
    }

    res.json(response);
});

// POST /account/resetpassword
router.post('/resetpassword', async function(req, res) {
    console.log('POST /account/resetpassword');
    let response;

    try {
        response = await mutation.resetPassword(req.body).$fragment(slimUser);
        signInUser(response.id);
    } catch (error) {
        response = handleError(error);
        res.status(400);  // bad request
    }

    res.json(response);
});

module.exports = router;