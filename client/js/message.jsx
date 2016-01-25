import React from 'react';
import ReactDOM from 'react-dom';

export default React.createClass({
    render: function(){
        var cname = 'ui '+this.props.msgType + ' message';
        return (
            <div className={cname}>
                <div className='header'>
                    {this.props.heading}
                </div>
                <p>{this.props.message}</p>
            </div>
        );
    }
});
