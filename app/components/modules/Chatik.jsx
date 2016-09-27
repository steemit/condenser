import React from 'react';
import CloseButton from 'react-foundation-components/lib/global/close-button';

export default class Chatik extends React.Component {
    constructor(props) {
        super(props);
        this.state = {open: false};
    }

    toggle() {
        if (!this.state.toggled) {
            setTimeout(this.setState({toggled: true}), 500)
        }
        this.setState({open: !this.state.open});
    }

    link() {
        return this.state.toggled?"https://chat.golos.io":""
    }

    iconUrl(){ return "https://avatars1.githubusercontent.com/RocketChat?&s=48"}

    chatikClass(){
        return 'chatik '
    }

    buttonClass(){
        return this.state.open?"open":""
    }

    render() {
        return <div className={this.chatikClass()+this.buttonClass()}>
            <button className={this.buttonClass()} style={{bottom:'0', position:'absolute', width:'48px', height:'48px', left:'-48px'}} onClick={this.toggle.bind(this)}><img src={this.iconUrl()} /></button>
            <div className="sidebar" style={{position:'relative', width:'100%', height:'100%'}}>
                <iframe src={this.link()} width="100%" height="100%" />
            </div>
        </div>;
    }
}
