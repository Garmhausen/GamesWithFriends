require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const { prisma } = require('./prisma');
const routes = require('./routes');

// start app
const app = express();

// ------ BEGIN MIDDLEWARE ------
const corsOptions = {
    origin: process.env.FRONTEND_URI,
    optionsSuccessStatus: 200,
    credentials: true
}
app.use(cors(corsOptions));

app.use(cookieParser());

// add userId to requests
app.use((req, res, next) => {
    const { GWFToken } = req.cookies;

    if (GWFToken) {
        const { userId } = jwt.verify(GWFToken, process.env.TOKEN_SECRET);
        req.userId = userId;
    }

    return next();
});

// add user to request if they are logged in
app.use(async (req, res, next) => {
    if (!req.userId) return next();

    const user = await prisma
        .user({ id: req.userId })
        .$fragment(`{
            id
            name
            email
            permissions
        }`)
        .catch((err) => {
            console.log('error', err); // TODO: better error handling
        });
    req.user = user;
    
    return next();
});

// ------ END MIDDLEWARE ------

app.use(routes);

// setup for socket.io
const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', () => { /* … */ });

server.listen(process.env.PORT || 3000, function () {
    console.log(`Express server listening on port ${this.address().port} in ${app.settings.env} mode`);
});