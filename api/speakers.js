var EventEmitter = require('events'),
    em = new EventEmitter();

var Mpg = require('./mpg123.js'),
    speakers = new Mpg(),
    Queue = require('./queue');

var queue = new Queue();

var isPaused = false,
    currentTime = 0.0,
    songLength = 0.0,
    lastUpdateGap = 0.0;

var config = require('../config/speakers.js');

speakers.seekTimeOffset = function(position){
    this._cmd('JUMP', position+'s');
};

speakers.playPaused = function(uri){
    this._cmd('LOADPAUSED', uri);
};

/* SONG QUEUE FORMAT
 * uri - uniform resource identifier (works with addresses and files)
 * title - song name
 * artist
 * [genre]
 * [album]
 * [date]
 * [artwork]
 * ?method? - add if adding youtube or something

//TODO
// Modifiy the Mpg123 source to enable '--fuzzy' command line argument (faster seeking, at lower accuracy)

//NOTE: from the mpg123 source
// emits a 'frame' event containing frame info whenver it changes (which is frequently)
//

/*
 * Handles playback of music. NOT for processing data (e.g. finding song metadata from soundcloud)
 * Implements the song queue/control structure. Emits events on song changes and such
 */

//Allows the queue to auto-update when a song finishes
//this isn't called if a song is cut off by a skip
//NOTE however, it does occur if an attempt to pause occurs when no song is queued
speakers.on('end', function(){
    if(queue.hasNext()){
        em.emit('end');
        queue.pop();
        positionChanged();
    }
});

speakers.on('frame', function(data){
    if(data[0] === '0'){ //Update song data
        songLength = parseFloat(data[3]);
        currentTime = 0.0;
        lastUpdateGap = 0.0;
        em.emit('time', {pos: currentTime, length: songLength});
    }else{
        var time = parseFloat(data[2]);
        lastUpdateGap += time - currentTime;
        if(lastUpdateGap >= config.updateGap){
            em.emit('time', {pos: time, length: songLength});
            lastUpdateGap = 0.0;
        }
        currentTime = time;
    }
});

speakers.on('jump', function(){
    lastUpdateGap = 0.0;
    currentTime = 0.0;
});


speakers.on('error', function(err){
    em.emit('error', err);
});

//Ideally it plays it immediately - if it doesn't it should have some skip command available
//Utility to call when the current index changes in the queue, so the speakers can update
function positionChanged(){
    if(queue.hasNext()){
        if(isPaused){
            speakers.playPaused(queue.peek().uri);
        }else{
            speakers.play(queue.peek().uri);
        }
        em.emit('time', {pos: 0.0, length: songLength});
        em.emit('next', queue.peek());
    }else{
        speakers.stop();
    }
}

//TODO soundlcoud urls expire. THe error handling is in place for the backend, but modify the
//parser so it has a setup to parse the url immediately before
exports.addSong = function(songData){
    var wasEmpty = !queue.hasNext();
    queue.push(songData);

    if(wasEmpty){
        if(isPaused){
            speakers.playPaused(songData.uri);
        }else{
            speakers.play(songData.uri);
        }
        em.emit('time', {pos: 0.0, length: songLength});
    }
    em.emit('add', songData);
};

//Returns true if a skip occurs, or if it was prevented
exports.skip = function(){
    if(queue.hasNext()){
        queue.pop();
        positionChanged();
        return true;
    }
    return false;
};

//Returns true if able to return to the previous song
exports.previous = function(){
    if(!queue.atStart()){
        queue.unpop();
        positionChanged();
        return true;
    }
    return false;
};

exports.restart = function(){
    positionChanged();
};

exports.seek = function(position){
    speakers.seekTimeOffset(position);
};

exports.pause = function(){
    speakers.pause();
    isPaused = !isPaused;
};

exports.isPaused = function(){
    return isPaused;
};

exports.currentSongLength = function(){
    return songLength;
};

exports.currentTime = function(){
    return currentTime;
};

exports.serialize = function(){
    return queue.serialize();
};

exports.queue = queue;

exports.events = em;
