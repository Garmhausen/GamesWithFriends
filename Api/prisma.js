// this file connects to the db.
// it currently only connects to a local db, but will hold the logic for dealing with different dbs in 
// different environments as the project matures.
const { prisma } = require('./generated/prisma-client');

module.exports = {
    prisma,
}