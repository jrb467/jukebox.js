// Implements a queue of json data stored. Retains old values
// NOTE: for now it's all done in RAM. May eventually migrate to pushing the ends of the queue away from the current playback position to file
// Implements pop, push, all (gets all songs), get (for specific index), peek, index, hasNext 

//NOTE: SONG DATA FORMAT is in speakers.js

function Queue(){
    this.newSongs = [];
    this.oldSongs = [];
}

Queue.prototype = {

    //Newer songs last
    all: function(){
        return this.oldSongs.concat(this.newSongs);
    },

    get: function(index){
        if(index < this.oldSongs.length){
            return this.oldSongs[index];
        }else{
            return this.newSongs[index+this.oldSongs.size()];
        }
    },

    pop: function(){
        this.oldSongs.push(this.newSongs.shift());
    },

    unpop: function(){
        this.newSongs.unshift(this.oldSongs.pop());
    },

    hasNext: function(){
        return this.newSongs.length !== 0;
    },

    atStart: function(){
        return this.oldSongs.length === 0;
    },

    push: function(songData){
        this.newSongs.push(songData);
    },

    index: function(){
        return this.oldSongs.length;
    },

    peek: function(){
        return this.newSongs[0];
    },

    isEmpty: function(){
        return this.oldSongs.length === 0 && this.newSongs.length === 0;
    },

    serialize: function(){
        return {oldSongs: this.oldSongs, newSongs: this.newSongs};
    }
};

module.exports = Queue;
