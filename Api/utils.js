const jwt = require('jsonwebtoken');

exports.handleError = (error) => {
    console.log('There was an error:', error.message); // TODO: replace with actual logging
    
    return error.message;
};

exports.hasPermission = (user, permissionsNeeded) => {
    if (!user) {
        throw new Error(`You must be logged in!`);
    }

    const matchedPermissions = user.permissions.filter(permissionTheyHave => permissionsNeeded.includes(permissionTheyHave));

    if (!matchedPermissions.length) {
        throw new Error(`You do not have sufficient permissions.`);
    }
};

exports.signInUser = (userId, res) => {
    const GWFToken = jwt.sign({ userId }, process.env.TOKEN_SECRET);  // TODO: fix

    res.cookie('GWFToken', GWFToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year
    });
};

exports.makeToken = (userId, res) => {
    const token = {
        userId,
        expiration: 1000 * 60 * 60 * 24 * 365 // 1 year
    }

    return jwt.sign(token, process.env.TOKEN_SECRET); // TODO: fix
}

exports.slimUser = `
    {
        id
        email
        name
        sessions {
            id
        }
        permissions
    }
`;

exports.verifyLoggedIn = (req, res, next) => {
    if (!req.userId) {
        res.status(400); // bad request
        res.json({ message: 'You must be logged in!' });
    } else {
        return next();
    }
};
