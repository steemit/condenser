import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { APP_DOMAIN } from 'app/client_config';

const PREVIEW_URL = 'https://img.youtube.com/vi';
const PLAYER_URL = 'https://www.youtube.com/embed';

export default class YoutubePlayer extends PureComponent {
    static propTypes = {
        className: PropTypes.string,
        youTubeId: PropTypes.string.isRequired,
        width: PropTypes.number,
        height: PropTypes.number,
        dataParams: PropTypes.string,
    };

    static defaultProps = {
        width: 640,
        height: 360,
        dataParams: `enablejsapi=0&rel=0&origin=https://${APP_DOMAIN}`,
    };

    constructor(props) {
        super(props);

        this.state = {
            preview: true,
        };
    }

    render() {
        const { youTubeId, width, height, dataParams, className } = this.props;
        const { preview } = this.state;

        if (preview) {
            const size = getPreviewName(width);
            const preview = `${PREVIEW_URL}/${youTubeId}/${size}.jpg`;

            return (
                <div
                    className={cn('YoutubePlayer YoutubePlayer_preview', className)}
                    onClick={this.onPlay}
                    style={{ backgroundImage: 'url(' + preview + ')' }}
                />
            );
        } else {
            const src = `${PLAYER_URL}/${youTubeId}?autoplay=1&autohide=1&${dataParams}`;

            return (
                <div className={cn('YoutubePlayer', className)}>
                    <iframe
                        width={width}
                        height={height}
                        src={src}
                        frameBorder="0"
                        allowFullScreen
                    />
                </div>
            );
        }
    }

    onPlay = () => {
        this.setState({ preview: false });
    };
}

function getPreviewName(width) {
    if (width <= 320) {
        return 'mqdefault';
    } else if (width <= 480) {
        return 'hqdefault';
    } else {
        return '0';
    }
}
