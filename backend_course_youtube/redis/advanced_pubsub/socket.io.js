
    // Connect to Socket.io
    const socket = io();
    
    // DOM elements
    const messagesEl = document.getElementById('messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const usernameInput = document.getElementById('username');
    const setUsernameBtn = document.getElementById('set-username');
    const roomButtons = document.querySelectorAll('.room-btn');
    const currentRoomEl = document.getElementById('current-room');
    
    // State
    let username = '';
    let currentRoom = '';
    
    // Set username
    setUsernameBtn.addEventListener('click', () => {
      username = usernameInput.value.trim();
      if (username) {
        document.querySelector('.user-setup').style.display = 'none';
      }
    });
    
    // Join room
    roomButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const room = btn.getAttribute('data-room');
        
        // Leave current room if any
        if (currentRoom) {
          socket.emit('leave room', currentRoom);
        }
        
        // Join new room
        currentRoom = room;
        socket.emit('join room', room);
        currentRoomEl.textContent = `Room: ${room}`;
        
        // Clear messages
        messagesEl.innerHTML = '';
      });
    });
    
    // Send message
    function sendMessage() {
      const message = messageInput.value.trim();
      if (message && username && currentRoom) {
        socket.emit('chat message', {
          username,
          message,
          room: currentRoom
        });
        messageInput.value = '';
      }
    }
    
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') sendMessage();
    });
    
    // Receive messages
    socket.on('chat message', data => {
      const li = document.createElement('li');
      const time = new Date(data.timestamp).toLocaleTimeString();
      li.textContent = `[${time}] ${data.username}: ${data.message}`;
      messagesEl.appendChild(li);
      
      // Auto-scroll
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
