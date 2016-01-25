import React from 'react';

export default React.createClass({
    componentWillUnmount: function(){
        console.log('Song unmounting');
    },
    //title, artist, [album, genre]
    //get rid of bold decoration for headers
    render: function(){
        var cls = this.props.old ? 'dimmed' : '';
        var cls2 = this.props.current ? 'olive inverted' : '';
        cls = 'ui '+cls+' dimmable raised '+cls2+' segment song';
        var img = (this.props.image) ? this.props.image : '/noart.svg';
        return (
            <div className={cls}>
                <div className='ui simple dimmer'></div>
                <img className='icon' src={img} />
                <div className='metadata'>
                    <h1>{this.props.title}</h1>
                    <h4>{this.props.artist}</h4>
                </div>
            </div>
        );
    }
});
