import React, { Component } from 'react';
import { connect } from 'react-redux';
import tt from 'counterpart';

import DraftSummary from '../cards/DraftSummary';

class PostDrafts extends Component {
    constructor(props) {
        super();
    }

    render() {
        debugger;
        const { username, onDraftsClose } = this.props;

        let draftList = JSON.parse(localStorage.getItem('draft-list')) || [];
        draftList = draftList.filter(data => data.author === username);
        const drafts = draftList.map((draft, idx) => (
            <div key={idx} className="drafts-option">
                <DraftSummary post={draft} onDraftsClose={onDraftsClose} />
            </div>
        ));

        return (
            <div>
                <div className="row">
                    <h3 className="column">{tt('reply_editor.draft')}</h3>
                </div>
                <hr />
                <div className="drafts-list">{drafts}</div>
            </div>
        );
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const username = state.user.getIn(['current', 'username']);
        const onDraftsClose = state.user.getIn('onDraftsClose');
        return {
            ...ownProps,
            fields: [],
            username,
            initialValues: {},
            onDraftsClose,
        };
    }
)(PostDrafts);
