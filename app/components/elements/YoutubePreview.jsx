/* eslint react/prop-types: 0 */
import React from 'react'
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'

const {string, number} = React.PropTypes

/** Lots of iframes in a post can be very slow.  This component only inserts the iframe when it is actually needed. */
export default class YoutubePreview extends React.Component {
    static propTypes = {
        youTubeId: string.isRequired,
        width: number,
        height: number,
        dataParams: string,
    }

    static defaultProps = {
        width: 640,
        height: 480,
        dataParams: 'enablejsapi=0&rel=0&origin=https://steemit.com'
    }

    constructor() {
        super()
        this.state = {}
    }

    shouldComponentUpdate = shouldComponentUpdate(this, 'YoutubePreview')

    onPlay = () => {
        this.setState({play: true})
    }

    render() {
        const {youTubeId, width, height, dataParams} = this.props
        const {play} = this.state
        if(!play) {
            // mqdefault.jpg (medium quality version, 320px × 180px)
            // hqdefault.jpg (high quality version, 480px × 360px
            // sddefault.jpg (standard definition version, 640px × 480px)
            const thumbnail = width <= 320 ? 'mqdefault.jpg' : width <= 480 ? 'hqdefault.jpg' : '0.jpg'
            const previewLink = `http://img.youtube.com/vi/${youTubeId}/${thumbnail}`
            return (
                <div className="youtube" onClick={this.onPlay}>
                    <div className="play"></div>
                    <img src={previewLink} style={{width, maxWidth: width, height, maxHeight: height}} />
                </div>
            )
        }
        const autoPlaySrc = `//www.youtube.com/embed/${youTubeId}?autoplay=1&autohide=1&${dataParams}`
        return <iframe width={width} height={height} src={autoPlaySrc} frameBorder="0" allowFullScreen="true"></iframe>
    }
}
