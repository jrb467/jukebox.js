import React from 'react';
import ProgressBar from './progressBar.jsx';
import config from '../../config/speakers.js';

export default React.createClass({
    cmd: function(cmd){
        return function(event){
            $.ajax({type: 'POST', url: '/api/cmd', data: 'cmd='+cmd,
                success: function(data, status){
                    console.log('damn son you did a '+cmd);
                },
                error: function(req, status, err){
                    console.log('are you a fucking idiot?');
                }
            });
        };
    },
    render: function(){
        var cname = this.props.paused ? 'play' : 'pause';
        cname = 'ui big ' + cname + ' link icon';
        return (
            <div id="song-info" className="row">
                {//TODO playback, songinfo, etc (see if can extend the song item)
                }
                <i className="ui big step backward link icon" onClick={this.cmd('previous')}></i>
                <i className='ui big undo link icon' onClick={this.cmd('restart')}></i>
                <i className={cname} onClick={this.cmd('pause')}></i>
                <i className="ui big step forward link icon" onClick={this.cmd('skip')}></i>
                <ProgressBar socket={this.props.socket}/>
            </div>
        );
    }
});
