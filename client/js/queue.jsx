import React from 'react';
import ReactTransition from 'react-addons-css-transition-group';
import Song from './song.jsx';

function extractSongJSX(song){
    var props = {};
    if(song.title) props.title = song.title;
    else props.title = 'Unknown';
    if(song.artist) props.artist = song.artist;
    else props.artist = 'Unknown';
    if(song.image) props.image = song.image;
    if(song.album) props.album = song.album;
    if(song.genre) props.genre = song.genre;
    return props;
}

export default React.createClass({
    render: function(){
        var q = this.props.songs;
        //As the order of the songs doesn't change (YET)
        //just assign their key to be their index
        //NOTE if songs are ever removed, be sure to note that
        var index = 0;
        var oldItems = q.oldSongs.map(function(song){
            var props = extractSongJSX(song);
            props.key = ''+index;
            index++;
            return <Song {...props} old/>;
        });
        var currentInd = index;
        var newItems = q.newSongs.map(function(song){
            var props = extractSongJSX(song);
            if(index === currentInd){
                props.current = true;
            }
            props.key = ''+index;
            index++;
            return <Song {...props}/>;
        });
        var songs = oldItems.concat(newItems);
        return (
            <div id="queue" >
                <ReactTransition transitionName='queue' transitionEnterTimeout={500} transitionLeaveTimeout={500}>
                    {songs}
                </ReactTransition>
            </div>
        );
    }
});
