
//Takes in a socket.io object
module.exports = function(io){

var router = require('express').Router(),
    c = require('./controller')(io);

router.post('/add', c.addSong);

router.get('/songs', c.getAllSongs);

router.get('/current', c.getCurrrentSong);

router.get('/time', c.getCurrentTime);

router.get('/length', c.getSongLength);

router.post('/cmd', c.handleCommand);

return router;

};
