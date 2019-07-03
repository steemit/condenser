import React from 'react';
import tt from 'counterpart';

class ExternalLink extends React.Component {
    render() {
        const externalUrl = this.props.location.query.url;

        const goBack = e => {
            this.props.router.goBack();
        };

        return (
            <div>
                <div className="external-link-container">
                    <div className="row">
                        <div className="column">
                            <h3>
                                {tt('externallink_jsx.about_to_leave_steemit')}
                            </h3>
                            <hr />
                            <p>
                                {tt(
                                    'externallink_jsx.the_link_you_clicked_is_external'
                                )}:<br />
                                <b>{externalUrl}</b>.
                            </p>
                            <p>
                                {tt(
                                    'externallink_jsx.we_just_want_to_verify_to_continue'
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="column button-container">
                            <button className="button hollow" onClick={goBack}>
                                {tt('externallink_jsx.go_back')}
                            </button>{' '}
                            <a
                                className="button"
                                href={externalUrl}
                                rel="nofollow noopener external"
                            >
                                {tt('externallink_jsx.open_link')}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'external_link',
    component: ExternalLink,
};
