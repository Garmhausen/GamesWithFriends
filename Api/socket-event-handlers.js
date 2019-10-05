const handlers = function(io) {
  return function (socket, next) {
    socket.on('connection', () => {
      console.log('socket.io connection event happened');
    });

    socket.emit('event', { hello: 'world' });
    socket.on('my event', function(data) {
      console.log('my event handled.  data', data);
    })
    return next();
  }
};

module.exports = handlers;