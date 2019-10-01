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

function retrieveUserByEmail(email) {
    return prisma.user({ email });
}

module.exports = {
    retrieveSession,
    retrieveUser,
    retrieveUsers,
    retrieveUserByEmail
}