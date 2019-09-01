const { prisma } = require('../prisma');

function retrieveUser(id) {
    
    return prisma.user({ id });
}

function retrieveUsers() {

    return prisma.users({});
}

module.exports = {
    retrieveUser,
    retrieveUsers,
}