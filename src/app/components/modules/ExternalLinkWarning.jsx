import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import tt from 'counterpart';

class ExternalLinkWarning extends Component {
    static propTypes = {
        url: PropTypes.string.isRequired,
    };

    render() {
        const url = this.props.url;
        return (
            <span className="ExternalLinkWarning">
                <h4>{tt('externallink_jsx.about_to_leave_steemit')}</h4>
                <hr />
                <p>
                    {tt('externallink_jsx.the_link_you_clicked_is_external')}
                    <br />
                    <b>{url}</b>
                </p>
                <p>
                    {tt('externallink_jsx.we_just_want_to_verify_to_continue')}
                </p>
                <p>
                    <a
                        className="button hollow open-external-link"
                        href={url}
                        rel="nofollow noopener external"
                    >
                        {tt('externallink_jsx.open_link')}
                    </a>
                </p>
            </span>
        );
    }
}

export default connect()(ExternalLinkWarning);
