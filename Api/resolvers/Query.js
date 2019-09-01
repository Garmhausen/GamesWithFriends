const { prisma } = require('../prisma');

function retrieveSession(id) {
    return prisma.session({ id });
}

function retrieveUser(id) {
    return prisma.user({ id });
}

function retrieveUsers() {
    return prisma.users({});
}

module.exports = {
    retrieveSession,
    retrieveUser,
    retrieveUsers,
}