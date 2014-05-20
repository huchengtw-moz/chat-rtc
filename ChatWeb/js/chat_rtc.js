
(function(exports) {
  function $(id) {
    return document.getElementById(id);
  }

  function ChatRTC() {
  }

  ChatRTC.prototype.start = function start() {
    this.initUI();
    return this;
  };

  ChatRTC.prototype.initUI = function initUI() {
    this.loginPane = $('login-pane');
    this.loginPane.hidden = false;

    $('connect-button').addEventListener('click', this);
    $('create-room-button').addEventListener('click', this);
  };

  ChatRTC.prototype.handleEvent = function handleEvent(e) {
    switch(e.type) {
      case 'click':
        switch (e.target.id) {
          case 'connect-button':
              this.connect($('id-input').value, $('room-id-input').value);
            break;
          case 'create-room-button':
              this.createRoom($('id-input').value);
            break;
        }
        break;
    }
  };

  ChatRTC.prototype.connect = function connect(userId, roomId) {

  };

  ChatRTC.prototype.createRoom = function createRoom(userId) {

  };

  exports.ChatRTC = ChatRTC;
})(window);

window.addEventListener('load', function(e) {
  new ChatRTC().start();
});
