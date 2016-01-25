import React from 'react';
import Message from './message.jsx';

export default React.createClass({
    getInitialState: function(){
        return {fileErr: null, soundcloudErr: null};
    },
    formSubmit: function(event){
        var self = this;
        event.preventDefault();
        var n = event.target;
        var action = n.attributes.getNamedItem('action').value;
        var formData = new FormData($(n)[0]);
        $.ajax({type: 'POST', url: action, data: formData, contentType: false, processData: false, cache: false,
            success: function(data, status){
                self.setState({fileErr: null, soundcloudErr: null});
                console.log('Song submission success');
            },
            error: function(req, status, err){
                self.setState({fileErr: req.responseJSON.error});
                console.log('Dammit you fucked up the song submission you scrub');
            }
        });
    },
    fileChanged: function(event){
        var n = event.target;
        var file = $(n).prop('files')[0];
        $('#'+$(n).prop('id')+'-label').text(file.name);
    },
    render: function(){
        return (
            <div id="upload">
                <div className="ui tabular secondary pointing menu">
                    <a className="active item" data-tab='files'>
                        File
                    </a>
                    <a className="item" data-tab='soundcloud'>
                        Soundcloud
                    </a>
                </div>
                <div className="ui active tab basic segment" data-tab='files'>
                    <form action='/api/add' className="ui form" onSubmit={this.formSubmit}>
                        <input type='hidden' name='source' value='file'/>
                        <div className="field">
                            <label htmlFor="song-file" className="ui icon button">
                                <i className="file icon"></i>
                                File
                            </label>
                            <input type="file" id="song-file" name="song" onChange={this.fileChanged} />
                            <p id="song-file-label">No file selected</p>
                        </div>
                        {/*
                        <div className="field">
                            <label>
                                Title
                            </label>
                            <input type='text' name='title' />
                        </div>
                        <div className="field">
                            <label>
                                Artist
                            </label>
                            <input type='text' name='artist' />
                        </div>
                        */}
                        <input type='submit' className="ui submit button" name='Upload' />
                    </form>
                    {(this.state.fileErr) ? <Message msgType='error' heading='Submission Error' message={this.state.fileErr}/> : ''}
                </div>
                <div className="ui tab basic segment" data-tab='soundcloud'>
                    <form action='/api/add' className="ui form" onSubmit={this.formSubmit}>
                        <input type='hidden' name='source' value='soundcloud' />
                        <div className="field">
                            <label>URL</label>
                            <input type='text' name='url' />
                        </div>
                        <input type='submit' name='Upload' className="ui submit button"/>
                    </form>
                </div>
            </div>
        )
    }
});
