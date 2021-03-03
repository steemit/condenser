/* eslint-disable no-underscore-dangle */
import React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import ReplyEditorNew from 'app/components/elements/ReplyEditorNew';
import { SUBMIT_FORM_ID } from 'shared/constants';
import Callout from 'app/components/elements/Callout';
import * as appActions from 'app/redux/AppReducer';

const formId = SUBMIT_FORM_ID;
const SubmitReplyEditor = ReplyEditorNew(formId);

function _redirect_url(operations) {
    try {
        const { category } = operations[0][0][1];
        return '/created/' + category;
    } catch (e) {
        console.error('redirect_url', e);
    }
    return '/created';
}

class SubmitPost extends React.Component {
    constructor() {
        super();
        this.success = operations => {
            localStorage.removeItem('replyEditorData-' + formId);
            browserHistory.push(_redirect_url(operations));
        };
    }
    componentWillMount() {
        this.props.setRouteTag();
    }
    render() {
        if (!this.props.username) {
            return <Callout>Log in to make a post.</Callout>;
        }

        return (
            <SubmitReplyEditor
                type="submit_story"
                successCallback={this.success}
            />
        );
    }
}

module.exports = {
    path: 'submit.html',
    component: connect(
        (state, ownProps) => ({
            username: state.user.getIn(['current', 'username']),
        }),
        dispatch => ({
            setRouteTag: () =>
                dispatch(appActions.setRouteTag({ routeTag: 'submit_post' })),
        })
    )(SubmitPost),
};
