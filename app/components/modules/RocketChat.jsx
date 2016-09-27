import React from 'react'

export default class RocketChat extends React.Component {

    state = {toggle: false}

    toggle = () => {
        this.setState({toggle: !this.state.toggle});
    }

    render() {
        const {state} = this
        const buttonClass = state.toggle ? "" : "open";
        const width = state.toggle ? '500vw' : '0';
        const height = state.toggle ? "500vh" : '0';
        const url = 'https://avatars1.githubusercontent.com/RocketChat?&s=48'

        return  <div className="RocketChat">
                    <button className={buttonClass} onClick={this.toggle}><img src={url} /></button>
                    <iframe src="https://chat.golos.io" width={width} height={height} />
        </div>;
    }
}
