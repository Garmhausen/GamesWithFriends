const express = require('express');
const router = express.Router();
const { hasPermission, handleError, slimUser, verifyLoggedIn } = require('../utils');

const mutation = require('../resolvers/Mutation');
const query = require('../resolvers/Query');

// all routes in this file begin with /user

// all routes below require login
router.use((req, res, next) => verifyLoggedIn(req, res, next));

// GET /user/:id
router.get('/:id', async function(req, res) {
    console.log('GET /user/' + req.params.id);
    let response;

    try {
        if (req.params.id != req.userId) {
            hasPermission(req.user, ['ADMIN']);
        }

        response = await query.retrieveUser(req.params.id).$fragment(slimUser);
    } catch (error) {
        response = handleError(error);
        res.status(400);  // bad request
    }
    
    res.json(response);
});

router.use(express.json()); // required for parsing json body in request

// PATCH /user/:id
router.patch('/:id', async function(req, res) {
    console.log('POST /user');
    console.log('body:', req.body);
    const updatingSelf = req.userId == req.params.id;
    const updates = { ...req.body };
    let response;

    if (updates.id) {
        delete updates.id;
    }
    if (updates.permissions) {
        delete updates.permissions;
    }

    try {
        if (!updatingSelf) {
            hasPermission(req.user, ['ADMIN']);
        }
        response = await mutation.updateUser(req.params.id, updates).$fragment(slimUser);
    } catch (error) {
        response = handleError(error);
        res.status(400); // bad request
    }

    res.json(response);
});

// DELETE /user/:id
router.delete('/:id', async function(req, res) {
    console.log(`DELETE /user/${req.params.id}`);
    const deletingSelf = req.userId == req.params.id;
    let response;

    try {
        if (!deletingSelf) {
            hasPermission(req.user, ['ADMIN']);
        }
        const result = await mutation.deleteUser(req.params.id);
        if (deletingSelf) {
            res.clearCookie('GWFToken');
        }
        response = ({ message: "success" });
    } catch (error) {
        response = handleError(error);
        res.status(400); // bad request
    }

    res.json(response);
});

// POST /user/:id/permissions
router.post('/:id/permissions', async function(req, res) {
    console.log(`POST /user/${req.params.id}/permissions`);
    console.log('body:', req.body);
    let response;

    try {
        hasPermission(req.user, ['ADMIN', 'PERMISSIONUPDATE']);
        response = mutation.updatePermissions(req.params.id, req.body.permissions).$fragment(slimUser);
    } catch (error) {
        response = handleError(error);
        res.status(400);
    }

    res.json(response);
})

module.exports = router;