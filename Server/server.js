
var static = require('node-static');
var http = require('http');
var file = new(static.Server)();

var port = process.argv[2] || 2013;

var app = http.createServer(function(req, res) {
  file.serve(req, res);
}).listen(port);

var io = require('socket.io').listen(app);
// room name to roomData. The key is "rm-" + name.
var roomMap = {};
// socket id to roomData. The key is "sid-" + socket.id.
var socketMap = {};


/**
 * Every connection should provide its iceCandidate. We will send the
 * iceCandidate to chatroom owner and members. The offer is created by member
 * and the answer is bridged to member for owner.
 */
io.sockets.on('connection', function(socket){

  /**
   * event: create => create a chatroom and be the owner
   *      room {String}: the name of room
   *      ownerName {String}: the user name of the owner
   *      iceCandidate {Object}: the ice candidate object from web rtc
   */
  socket.on('create', function(room, ownerName, iceCandidate) {
    if (!room || !ownerName) {
      socket.emit('error', 'valid room or ownerName required.');
      return;
    }

    var roomData = {
      name: room;
      ownerSocket: socket,
      ownerName: ownerName,
      ownerIce: iceCandidate,
      members: []
    };

    roomMap['rm-' + room] = roomData;
    socketMap['sid-' + socket.id] = roomData;
  });

  /**
   * event: join => join a chatroom
   *      room {String}: the name of room
   *      userName {String}: the user name of the owner
   *      iceCandidate {Object}: the ice candidate object from web rtc
   *      offer {Object}: the offer object from web rtc
   *
   * This event sends:
   *   'ice' event: owner's iceCandidate to member.
   *   'member-joined' event: member's data to owner.
   */
  socket.on('join', function(room, userName, iceCandidate, offer) {
    if (!room || !roomMap['rm-' + room]) {
      socket.emit('error', 'valid room required.');
      return;
    }

    var roomData = roomMap['rm-' + room];
    socketMap['sid-' + socket.id] = roomData;
    roomData.members.push(socket);
    roomData.ownerSocket.emit('member-joined', { id: socket.id
                                                 name: userName,
                                                 ice: iceCandidate,
                                                 offer: offer });
    socket.emit('ice', roomData.ownerIce);
  });

  /**
   * event: bridge-answer => bridge a answer from owner to member
   *      answer {Object}: the name of room
   *      id {String}: member's id which is also socket.id
   */
  socket.on('bridge-answer', function(answer, id) {
    if (!answer || !id) {
      socket.emit('error', 'valid answer and id required.');
      return;
    }
    var roomData = socketMap['sid' + socket.id];
    var memberSocket = roomData.members.find(function(s) {
      if (s.id === id) {
        return s;
      }
    });
    if (!memberSocket) {
      socket.emit('error', 'valid room required.');
      return;
    }

    memberSocket.emit('answer', answer);
  });

  socket.on('disconnect', function() {
    if (socketMap['sid-' + socket.id]) {
      return;
    }
    var roomData = socketMap['sid-' + socket.id];
    delete socketMap['sid-' + socket.id];

    if (roomData.ownerSocket === socket) {
      // room owner, send room-closed to all members.
      delete roomMap['rm-' + roomData.data];
      roomData.members.forEach(function(s)) {
        socket.emit('room-closed', 'room owner had closed the room');
      };
    } else {
      // room member, remove it from owner and send member-disconnected to
      // owner.
      var idx = roomData.members.indexOf(socket);
      if (idx > -1) {
        roomData.members.splice(idx, 1);
        roomData.ownerSocket.emit('member-disconnected', socket.id);
      }
    }
  });
});

