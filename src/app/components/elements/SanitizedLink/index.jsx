import React from 'react';
import PropTypes from 'prop-types';
import tt from 'counterpart';
import classnames from 'classnames';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import { looksPhishy } from 'app/utils/Phishing';

export default class SanitizedLink extends React.Component {
    static propTypes = {
        url: PropTypes.string,
        text: PropTypes.string,
    };

    constructor() {
        super();
        this.shouldComponentUpdate = shouldComponentUpdate(
            this,
            'SanitizedLink'
        );
        this.state = {
            revealPhishyLink: false,
        };
    }

    onRevealPhishyLink = e => {
        e.preventDefault();
        this.setState({ revealPhishyLink: true });
    };

    render() {
        const { text, url } = this.props;

        const isPhishy = looksPhishy(url);

        const classes = classnames({
            SanitizedLink: true,
            'SanitizedLink--phishyLink': isPhishy,
        });

        if (!isPhishy) {
            return (
                <a
                    className={classes}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {text}
                </a>
            );
        }

        if (this.state.revealPhishyLink) {
            return (
                <span
                    className={classes}
                    title={tt('sanitizedlink_jsx.phishylink_caution')}
                >
                    {text}
                </span>
            );
        }

        return (
            <span className={classes}>
                <span className="phishylink-caution">
                    {tt('sanitizedlink_jsx.phishylink_caution')}
                </span>
                <span
                    className="phishylink-reveal-link"
                    role="button"
                    onClick={this.onRevealPhishyLink}
                >
                    {tt('sanitizedlink_jsx.phishylink_reveal')}
                </span>
            </span>
        );
    }
}
