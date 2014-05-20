(function(exports) {
  function ChatClient() {

  }

  ChatClient.prototype.call = function() {
    var localPC = new RTCPeerConnection(null,
                                        {optional: [{RtpDataChannels: true}]});
    this.localPC = localPC;
    localPC.onicecandidate = (evt) => {
      if (evt.candiate) {
        // send candidate to server with user info.
      }
    };

    try {
      this.creatDataChannel();
    } catch (ex) {
      console.error(ex);
      alert('Your browser doesnt support WebRTC\'s data channel');
    }
    this.createOffer();
  };

  ChatClient.prototype.creatDataChannel = function() {
    this.dataChannel = this.localPC.createDataChannel('chat',
                                                      {reliable: false});
    this.dataChannel.onopen = (evt) => {
      console.log('data channel is opened.');
    };
    this.dataChannel.onclose = (evt) => {
      console.log('data channel is closed.');
    };
    this.dataChannel.onmessage = (evt) => {
      this.handleIncomingMessage(evt.data);
    };
  };

  ChatClient.prototype.createOffer = function() {
    this.localPC.createOffer((desc) => {
      this.localPC.setLocalDescription(desc);
      this.localDescription = desc;
      // send description to server with user info
    }, (e) => {});
  };

  ChatClient.prototype.handleIncomingMessage = function(data) {
    // show message on the UI.
  };

  exports.ChatClient = ChatClient;
})(window);
