const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: 'http://127.0.0.1:5500',
  },
});

const state = {};

io.on('connection', (socket) => {
  socket.emit('update', state);

  socket.on('draw', (data) => {
    const { coord, params } = data;
    const key = `${coord.x},${coord.y}`;
    state[key] = params;
    io.emit('draw', data);
  });

  socket.on('disconnect', () => {
    console.log('<<', socket.id);
  });
});

const PORT = 8888;
server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
