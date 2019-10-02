const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const { randomBytes } = require('crypto');
const { transport, craftEmail } = require('../mail');
const { prisma } = require('../prisma');
const { handleValidationErrors } = require('../utils');

function deleteUser(id) {

    return prisma.deleteUser({ id })
}

async function requestReset(email) {
    const user = await prisma.user({ email });

    if (!user) {
        throw new Error(`No user found for email ${email}.`);
    }

    const randomBytesPromisified = promisify(randomBytes);
    const resetToken = (await randomBytesPromisified(20)).toString('hex');
    const resetTokenExpiration = Date.now() + 3600000; // 1 hour expiration

    const result = await prisma.updateUser({
        where: { email },
        data: { resetToken, resetTokenExpiration }
    });

    const mailRes = await transport.sendMail({
        from: 'admin@admin.admin',
        to: user.email,
        subject: 'Password Reset Link',
        html: craftEmail(`
            Your password reset link is here!\n
            \n
            <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click here to reset</a>
        `)
    });

    return { message: "success!" };
}

async function resetPassword(args) {
    if (args.password != args.confirmPassword) {
        throw new Error('Passwords do not match!');
    }

    const [user] = await prisma.users({
        where: {
            resetToken: args.resetToken,
            resetTokenExpiration_gte: Date.now() - 3600000
        }
    });
    if (!user) {
        throw new Error('This token is invalid or expired!');
    }
    
    const password = await bcrypt.hash(args.password, 10);

    return prisma.updateUser({
        where: { email: user.email },
        data: {
            password,
            resetToken: null,
            resetTokenExpiration: null
        }
    });
}

async function signin({ email, password }) {
    const user = await prisma.user({ email });

    if (!user) {
        throw new Error(`No user found for email ${email}.`);
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
        throw new Error(`Invalid password!`);
    }

    return user;
};

async function signup(args) {
    args.email = args.email.toLowerCase();  // lowercase all emails going into the db
    delete args.confirmPassword;
    const password = await bcrypt.hash(args.password, 10);

    return prisma.createUser({
        ...args,
        password: password,
        permissions: { set: ['USER'] }
    });
};

function updatePermissions(id, permissions) {
    return prisma.updateUser({
        where: { id },
        data: {
            permissions: {
                set: permissions
            }
        }
    });
};

function updateUser(id, updates) {
    
    return prisma.updateUser({ where: { id }, data: updates });
}

function startNewSession(userId) {
    const newSession = {
        users: {
            connect: { 
                id: userId
            }
        },
        enabled: true
    };

    return prisma.createSession(newSession);
}

async function joinSession(sessionId, userId) {
    const session = await prisma.session({ id: sessionId });

    if (!session) {
        throw new Error("Session does not exist!");
    }
    if (!session.enabled) {
        throw new Error("Session is disabled!");
    }

    return prisma.updateSession({
        where: { id: sessionId },
        data: {
            users: {
                connect: {
                    id: userId
                }
            }
        }
    });
}

async function leaveSession(sessionId, userId) {
    const session = await prisma.session({ id: sessionId });

    if (!session) {
        throw new Error("Session does not exist!");
    }
    if (!session.enabled) {
        throw new Error("Session is disabled!");
    }

    return prisma.updateSession({
        where: { id: sessionId },
        data: {
            users: {
                disconnect: {
                    id: userId
                }
            }
        }
    });
}

module.exports = {
    deleteUser,
    requestReset,
    resetPassword,
    signin,
    signup,
    updatePermissions,
    updateUser,
    startNewSession,
    joinSession,
    leaveSession
};