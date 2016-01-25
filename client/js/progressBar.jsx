import React from 'react';
import config from '../../config/speakers.js';

export default React.createClass({
    time: 0.0,
    length: 0.0,
    updatePosition: function(pos, len){
        var p = pos / len * 100.0;
        var percent = p+'%';
        var e = $('#song-progress');
        e.find('.progress .bar').css('width', percent);
        e.find('.progress .marker').css('margin-left', percent);
        e.find('.time').html(this.secondsToMinutes(pos));
        e.find('.length').html(this.secondsToMinutes(len));
        this.time = pos;
        this.length = len;
    },
    secondsToMinutes: function(secs){
        var m = parseInt(secs / 60);
        var sInt = parseInt(secs - m * 60);
        var s = ('0'+sInt).slice(-2);
        return m+':'+s;
    },
    processTime: function(time){
        this.updatePosition(time.pos, time.length);
    },
    getPercentDistance: function(ev){
        var pRec = ev.target.parentElement.getBoundingClientRect();
        var x = ev.clientX;
        if(x <= 0){
            return this.time / this.length;
        }

        var relLeft = x - pRec.left;
        var p = relLeft / pRec.width;
        if(p < 0) p = 0.0;
        else if (p > 1) p = 1.0;
        return p;
    },
    //Gives appearance of seeking, but doesn't emit any event
    surfaceSeek: function(ev){
        this.props.socket.removeAllListeners('time');
        var percent = this.getPercentDistance(ev);
        this.updatePosition(this.length * percent, this.length, true);
    },
    seek: function(ev){
        $.ajax({type: 'POST', url: '/api/cmd', data: {cmd: 'seek', time: this.time},
            success: function(data, status){

            },
            error: function(req, status, err){
                console.log('ERROR: unable to seek');
            }
        });
        var self = this;
        this.props.socket.on('time', this.processTime);
        //this.updatePosition(...)
    },
    componentDidMount: function(){
        var self = this;
        this.props.socket.removeAllListeners('time');
        this.props.socket.on('time', this.processTime);
        this.props.socket.on('end', function(){
            self.updatePosition(1.0, 1.0);
        });
    },
    render: function(){
        return (
            <div id='song-progress'>
                <p className='time'>0:00</p>
                <div className='progress'>
                    <div className='bar'></div>
                    <div className='marker' onDrag={this.surfaceSeek} onDragEnd={this.seek}></div>
                </div>
                <p className='length'>0:00</p>
            </div>
        );
    }
});
