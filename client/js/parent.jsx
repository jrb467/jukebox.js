import React from 'react';
import Header from './header.jsx';
import Queue from './queue.jsx';
import Upload from './upload.jsx';
import SongInfo from './songinfo.jsx';
//TODO ensure this works!!! its taken from the api server code
import Queue2 from '../../api/queue.js';

//prepare outside (in case of g.c. problems??)
var socket = io();

export default React.createClass({
    getInitialState: function(){
        return {isPaused: false, queue: new Queue2()};
    },

    //Set up socket.io
    componentDidMount: function(){
        var self = this;
        //Socketio is already included in index.html, so it can be freely usedssss
        socket.on('state', function(state){
            self.state.queue.newSongs = state.newSongs;
            self.state.queue.oldSongs = state.oldSongs;
            self.setState({isPaused: state.isPaused});
            self.forceUpdate();
        });

        socket.on('new song', function(song){
            self.state.queue.push(song);
            self.forceUpdate();
        });

        socket.on('pause', function(isPaused){
            self.setState({isPaused: isPaused});
        });

        socket.on('skip', function(){
            console.log('Recieved skip');
            self.state.queue.pop();
            self.forceUpdate();
        });

        socket.on('previous', function(){
            self.state.queue.unpop();
            self.forceUpdate();
        });

        socket.on('next', function(){
            // ;-] nothing yet ;)
        });

        socket.on('end', function(){
            console.log('Recieved end');
            self.state.queue.pop();
            self.forceUpdate();
        });
    },

    render: function(){
        return (
            <div id="content">
                <Header />
                <div id="main-body" className="row">
                    <Queue songs={this.state.queue}/>
                    <Upload/>
                </div>
                <SongInfo socket={socket} paused={this.state.isPaused}/>
            </div>
        );
    }

});
