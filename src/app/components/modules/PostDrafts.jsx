import React, { Component } from 'react';
import { connect } from 'react-redux';
import tt from 'counterpart';

import DraftSummary from '../cards/DraftSummary';

class PostDrafts extends Component {
    constructor(props) {
        super();

        this.state = {
            draftList: [],
        };
    }

    componentDidMount() {
        this.getDraftList();
    }

    getDraftList = () => {
        const { username } = this.props;
        let draftList = JSON.parse(localStorage.getItem('draft-list')) || [];
        draftList = draftList.filter(data => data.author === username);
        this.setState({ draftList: draftList });
    };

    onDeleteDraft = post => {
        let draftList = JSON.parse(localStorage.getItem('draft-list')) || [];
        const draftIdx = draftList.findIndex(
            data =>
                data.author === post.author && data.permlink === post.permlink
        );
        draftList.splice(draftIdx, 1);
        localStorage.setItem('draft-list', JSON.stringify(draftList));
        this.getDraftList(); // state 업데이트
    };

    render() {
        const { username, onDraftsClose } = this.props;
        const { draftList } = this.state;

        const drafts = draftList.map((draft, idx) => (
            <div key={idx} className="drafts-option">
                <DraftSummary
                    idx={idx + 1}
                    post={draft}
                    onDraftsClose={onDraftsClose}
                    onDeleteDraft={this.onDeleteDraft}
                />
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
        return {
            ...ownProps,
            fields: [],
            username,
            initialValues: {},
            onDraftsClose: ownProps.onDraftsClose,
        };
    }
)(PostDrafts);
