const express = require('express');
const router = express.Router();
const { hasPermission, handleError, slimUser, verifyLoggedIn } = require('../utils');

const mutation = require('../resolvers/Mutation');
const query = require('../resolvers/Query');

// all routes in this file begin with /session

// all routes below require login
router.use((req, res, next) => verifyLoggedIn(req, res, next));

// Get /session/:id
router.get('/:id', async function(req, res) {
  console.log(`GET /session/${req.params.id}`);
  let response;

  try {
    response = await query.retrieveSession(req.params.id).$fragment(`
      {
        id
        users {
          id
          name
          email
        }
      }
    `);
  } catch (error) {
    response = handleError(error);
    res.status(404); // not found
  }

  res.json(response);
});

// Get /session/join/:id
router.get('/join/:id', async function (req, res) {
  console.log(`GET /session/join/${req.params.id}`);
  let response;

  try {
    response = await mutation.joinSession(req.params.id, req.userId);
  } catch (error) {
    response = handleError(error);
    res.status(400);
  }

  res.json(response);
})

// Get /session/leave/:id
router.get('/leave/:id', async function(req, res) {
  console.log(`Get /session/leave/${req.params.id}`);
  let response;

  try {
    response = await mutation.leaveSession(req.params.id, req.userId);
  } catch (error) {
    response = handleError(error);
    res.status(400);
  }

  res.json(response);
});

router.use(express.json()); // required for parsing json body in request

// Post /session/new
router.post('/new', async function(req, res) {
  console.log('POST /session/new');
  let response;

  try {
    response = await mutation.startNewSession(req.userId);
  } catch (error) {
    response = handleError(error);
    res.status(400);
  }

  res.json(response);
});

module.exports = router;