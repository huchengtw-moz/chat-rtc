
var static = require('node-static');
var http = require('http');
var file = new(static.Server)();

var port = process.argv[2] || 2013;

var app = http.createServer(function(req, res) {
  file.serve(req, res);
}).listen(port);

var io = require('socket.io').listen(app);
var roomMap = {};
io.sockets.on('connection', function(socket){

  socket.on('message', function(message) {
    console.log('Got message: ', message);
    // For a real app, should be room only (not broadcast)
    socket.broadcast.emit('message', message);
  });

  socket.on('create', function(room, ownerName) {
    if (!room || !ownerName) {
      socket.emit('error', 'valid room or ownerName required.');
    }

    roomMap[socket.id] = {
      name: room;
      ownerSocket: socket,
      ownerName: ownerName,
      members: []
    };
  });

  socket.on('join', function(room) {

  });

  socket.on('disconnect', function() {
    console.log('Room owner disconnected');
    delete roomMap[socket.id];
  });
});

