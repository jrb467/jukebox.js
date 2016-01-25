#!/usr/bin/env node

var http = require('http');
var config = require('./config/server');


function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = this.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

var credentials = {
    key: config.privateKey,
    cert: config.certificate
};

var port = normalizePort(config.port || '443');
var unsecuredPort = normalizePort(config.unsecuredPort || '80');

/**
 * Create HTTP server.
 */
//NOTE: this creates a blank express app (no functionality), which is used
//to create the server (so socket.io can be initialized), and then both the
//socket.io instance and the blank app are passed in to be initialized in ./app.js
var app = require('express')();
var server = http.createServer(app);
var io = require('socket.io')(server);

//Initializes the server functionality/sockets
require('./app.js')(app, io);


/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
