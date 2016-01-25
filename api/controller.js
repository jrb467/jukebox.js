//Takes in a socket.io object
module.exports = function(io){

var exports = {};

var speakers = require('./speakers'),
    parser = require('./parser');

io.on('connection', function(socket){
    console.log('Connection recieved');
    var state = speakers.serialize();
    state.isPaused = speakers.isPaused();
    socket.emit('state', state);
    socket.on('cmd', function(cmd){

    });
    socket.on('add', function(song){

    });
    /* NOTE: although methods working for doing song addition with socketio,
     * the older version is being kept b/c it works fine
    socket.on('add', function(params){
        //params has method + whatever else is needed
    });
    */
});

speakers.events.on('add', function(song){
    io.emit('new song', song);
});

speakers.events.on('next', function(song){
    io.emit('next');
});

speakers.events.on('end', function(song){
    io.emit('end');
});

speakers.events.on('error', function(err){
    console.log('Error detected in mpg123: '+err);
});

speakers.events.on('time', function(time){
    io.emit('time', time);
});

exports.addSong = function(req, res, next){
    if(req.body.source){
        console.log(req.body);
        switch(req.body.source){
            case 'file':
                if(req.file){
                    var params = {};
                    if(req.body.title) params.title = req.body.title;
                    if(req.body.artist) params.artist = req.body.artist;
                    //TODO ensure this always returns, or handles errors somehow
                    parser.parseFile(req.file, params, function(err, song){
                        if(err){
                            res.status(400);
                            res.json({error: err});
                        }else{
                            speakers.addSong(song);
                            res.end();
                        }
                    });
                }else{
                    res.status(400);
                    res.json({error: 'No file provided'});
                }
                break;
            case 'soundcloud':
                if(req.body.url){
                    //TODO make sure this always returns, or have some sort of error handling
                    parser.parseSoundcloud(req.body.url, function(err, song){
                        if(err){
                            res.status(400);
                            res.json({error: err});
                        }else{
                            speakers.addSong(song);
                            res.end();
                        }
                    });
                }else{
                    res.status(400);
                    res.json({error: 'No Soundcloud URI provided'});
                }
                break;
            default:
                res.status(400);
                res.json({error: 'No valid song source provided'});
        }
    }else{
        res.status(400);
        res.json({error: 'No song source provided'});
    }
};

// REturns object of the form {oldSongs: ..., newSongs: ...}
exports.getAllSongs = function(req, res, next){
    res.json(speakers.serialize());
};

exports.getCurrrentSong = function(req, res, next){
    res.json(speakers.queue.peek());
};

exports.getCurrentTime = function(req, res, next){
    res.json({time: speakers.getCurrentTime()});
};

exports.getSongLength = function(req, res, next){
    res.json({length: speakers.getSongLength()});
};

exports.handleCommand = function(req, res, next){
    var q = req.body;
    if(q.cmd){
        //Previous responses saved for posterity
        switch(q.cmd){
            case 'pause':
                speakers.pause();
                io.emit('pause', speakers.isPaused());
                res.json({isPaused: speakers.isPaused()});
                break;
            case 'skip':
                if(speakers.skip()){
                    io.emit('skip');
                }
                res.end();
                //res.send('dank skips have occured');
                break;
            case 'previous':
                //TODO ensure that an accidental skip (two people skip at the same time)
                //doesn't occur
                if(speakers.previous()){
                    io.emit('previous');
                }
                res.end();
                //res.send('damn son we goin back in time!');
                break;
            case 'restart':
                speakers.restart();
                io.emit('restart');
                res.end();
                //res.send('WHOA a restart!');
                break;
                //NOTE: everything below is old and unfinished n stuff
            case 'seek':
                if(q.time){
                    speakers.seek(q.time);
                    res.end();
                }else{
                    res.status(400);
                    res.json({error: 'No time provided'});
                }
                break;
            case 'ispaused':
                res.json({paused: speakers.isPaused()});
                break;
            case 'length':
                res.json({length: speakers.currentSongLength()});
                break;
            case 'timepos':
                //TODO
                res.json({positionTime: 111});
                break;
            case 'percentpos':
                //TODO {positionPercent: XXXX}
                break;
            case 'title':
                //TODO
                break;
            case 'artist':
                mplayer.getSongLength(function(length){
                    res.json({length: length});
                });
                break;
            case 'album':
                break;
            case 'uri':
                break;
            //Returns all the valid metadata for the song. Most likely the most used
            case 'info':
                //TODO needs to determine what the source is
                break;
            default:
                res.status(400);
                res.json({error: 'Invalid command'});
                break;
        }
    }else{
        res.status(400);
        res.json({error: 'No command included'});
    }
};

return exports;

};
