import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import cn from 'classnames';
import proxifyImageUrl from 'app/utils/ProxifyUrl';
import { loadUserLazy } from 'src/app/helpers/users';
import CircularProgress from './CircularProgress';

const DEFAULT_AVATAR = '/images/user.png';

class Userpic extends PureComponent {
    static propTypes = {
        account: PropTypes.string,
        votingPower: PropTypes.number,
        showProgress: PropTypes.bool,
        progressClass: PropTypes.string,
        imageUrl: PropTypes.string,
        size: PropTypes.number,
        onClick: PropTypes.func,
    };

    static defaultProps = {
        size: 48,
        hideIfDefault: false,
        showProgress: false,
    };

    state = {
        showProgress: this.props.showProgress,
        showPower: false,
    };

    extractUrl = () => {
        const { account, jsonMetadata, size, hideIfDefault, imageUrl } = this.props;

        let url = null;

        if (imageUrl) {
            url = imageUrl;
        } else if (jsonMetadata) {
            try {
                const md = JSON.parse(jsonMetadata);

                if (md.profile) {
                    url = md.profile.profile_image;
                }
            } catch (err) {
                console.error('Try to extract image url from users metaData failed!', err);
            }
        } else if (process.env.BROWSER) {
            loadUserLazy(account);
        }

        if (url && /^(?:https?:)\/\//.test(url)) {
            return proxifyImageUrl(url, size && size > 120 ? '320x320' : '120x120');
        }

        if (hideIfDefault) {
            return null;
        }

        return DEFAULT_AVATAR;
    };

    toggleProgress = () =>
        this.setState({
            showProgress: !this.state.showProgress,
            showPower: !this.state.showPower,
        });

    getVotingIndicator = percentage => {
        const { progressClass } = this.props;
        const { showProgress, showPower } = this.state;

        const votingClasses = cn(
            'voting_power',
            {
                'show-progress': showProgress,
                'show-power': showPower,
            },
            progressClass
        );

        return (
            <div className={votingClasses}>
                <CircularProgress
                    percentage={percentage}
                    show={showProgress}
                    size={this.props.size}
                    strokeWidth={2.5}
                />
            </div>
        );
    };

    render() {
        const { size, votingPower, showProgress, onClick } = this.props;

        const style = {
            width: size,
            height: size,
            backgroundImage: `url(${this.extractUrl()})`,
        };

        if (votingPower) {
            const percentage = votingPower / 100;
            const toggle = showProgress ? () => {} : this.toggleProgress;

            return (
                <div className="Userpic" onClick={toggle} style={style}>
                    {percentage ? this.getVotingIndicator(percentage) : null}
                </div>
            );
        } else {
            return <div className="Userpic" style={style} onClick={onClick} />;
        }
    }
}

export default connect((state, props) => {
    const { account } = props;

    return {
        jsonMetadata: state.global.getIn(['accounts', account, 'json_metadata']),
    };
})(Userpic);
