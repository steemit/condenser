import React from 'react';
import CloseButton from 'react-foundation-components/lib/global/close-button';

export default class Chatik extends React.Component {
    constructor(props) {
        super(props);
        this.state = {toggle: false};
    }

    toggle() {
        this.setState({toggle: !this.state.toggle});
    }

    sizeW(){
        return this.state.toggle?'500vw':'0'
    }

    sizeH(){
        return this.state.toggle?"500vh":'0'
    }

    buttonClass(){
        return this.state.toggle?"":"open"
    }

    render() {
        return <div className="chatik" style={{backgound:'white', position:'absolute', bottom:'0', right:'0'}}>
            <button className={this.buttonClass()} onClick={this.toggle.bind(this)}><img src="https://avatars1.githubusercontent.com/RocketChat?&s=48" /></button>
                <iframe src="https://chat.golos.io" width={this.sizeW()} height={this.sizeH()}/>
        </div>;
    }
}
