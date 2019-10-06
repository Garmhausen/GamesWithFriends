const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { handleError, signInUser, makeToken, slimUser } = require('../utils');
const query = require('../resolvers/Query');
const mutation = require('../resolvers/Mutation');

// all routes in this file begin with /account

router.use(express.json());

// POST /account/signup
router.post('/signup', [
    check('name', 'Name must not be empty')
        .isString()
        .trim(),
    check('email')
        .isEmail()
        .withMessage('Email is not a valid email')
        .normalizeEmail()
        .custom(email => {
            return query.retrieveUserByEmail(email).then(user => {
                if (user) {
                    return Promise.reject();
                }
            });
        })
        .withMessage('Email is already in use'),
    check('confirmPassword')
        .custom((confirmPassword, { req }) => {
            if (confirmPassword !== req.body.password) {
                throw new Error('Passwords must match');
            }
            return true;
        }),
    check('password', 'Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .isLength({ max: 24 })
        .withMessage('Password maximum length is 24 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one symbol')
], async function(req, res) {
    console.log('POST /account/signup');

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(422).json({ errors: validationErrors.array() });
    }

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
    let args = req.body;
    let response;

    try {
        const user = await mutation.signin(args);
        const token = makeToken(user.id, res);
        response = {
            email: user.email,
            name: user.name,
            token: token
        };
    } catch (error) {
        response = handleError(error);
        res.status(400); // Bad Request
    }

    res.json(response);
});

// POST /account/signout
router.post('/signout', function(req, res) {
    console.log('POST /account/signout');

    res.clearCookie('GWFToken');
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