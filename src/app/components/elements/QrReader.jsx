import React from 'react'

export default class Qr extends React.Component {
    static propTypes = {
        handleScan: React.PropTypes.func.isRequired,
        onClose: React.PropTypes.func,
    }
    constructor(props) {
        super()
        this.handleError = error => {console.error(error)}
        const {onClose, handleScan} = props
        this.handleScan = data => {
            handleScan(data)
            if(onClose) onClose()
        }
    }
    render() {
        const {handleError, handleScan} = this
        // Watch out, QrReader can mess up the nodejs server, tries to ref `navigator`
        // The server does not need a QrReader anyways
        if(!process.env.BROWSER) return <span></span>
        return <span></span>
        // a) Leaves the camera on when closing dialog - react-qr-reader v0.2.4
        // b) Only saw this work in Chrome - 0.2.4
        // try {
        //     const QrReader = require("react-qr-reader").default
        //     return <QrReader width={320} height={240} handleError={handleError}
        //         {...this.props} handleScan={handleScan} />
        // } catch(error) {
        //     console.log(error)
        //     return <span></span>
        // }
    }
}