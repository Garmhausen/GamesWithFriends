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

    // TODO:  move validation to a higher layer and abstract to a helper,
    //        maybe even use a library instead hand-rolling

    // ---- Validation Begin ----
    const errors = [];
    if (!args.email) {
        errors.push('no email received');
    }
    if (!args.name) {
        errors.push('no name received');
    }
    if (!args.password) {
        errors.push('no password received');
    }
    if (!args.confirmPassword) {
        errors.push('no confirm password received');
    }
    if (args.confirmPassword && args.password && args.confirmPassword !== args.password) {
        errors.push('passwords do not match');
    }

    handleValidationErrors(errors);
    // ---- Validation End ----

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

module.exports = {
    deleteUser,
    requestReset,
    resetPassword,
    signin,
    signup,
    updatePermissions,
    updateUser
};