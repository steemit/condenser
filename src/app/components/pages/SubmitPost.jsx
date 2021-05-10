/* eslint-disable no-underscore-dangle */
import React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import ReplyEditorNew from 'app/components/elements/ReplyEditorNew';
import ReplyEditor from 'app/components/elements/ReplyEditor';
import { SUBMIT_FORM_ID } from 'shared/constants';
import Callout from 'app/components/elements/Callout';
import * as appActions from 'app/redux/AppReducer';
import tt from 'counterpart';

const formId = SUBMIT_FORM_ID;
const SubmitReplyEditor = ReplyEditor(formId);
const SubmitReplyEditorNew = ReplyEditorNew(formId);

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
        this.state = {
            editorNew: false,
        };
        this.success = operations => {
            localStorage.removeItem('replyEditorData-' + formId);
            browserHistory.push(_redirect_url(operations));
        };
    }

    switchEditor() {
        this.setState({
            editorNew: !this.state.editorNew,
        });
    }

    componentWillMount() {
        this.props.setRouteTag();
    }
    render() {
        if (!this.props.username) {
            return <Callout>Log in to make a post.</Callout>;
        }
        const SwitchButton = (
            <span
                style={{
                    background: '#06D6A9',
                    color: '#fff',
                    fontSize: '14px',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    cursor: 'pointer',
                }}
                onClick={this.switchEditor.bind(this)}
            >{`${
                this.state.editorNew
                    ? tt('g.switch_old_editor')
                    : tt('g.switch_new_editor')
            }`}</span>
        );
        return (
            <div>
                {this.state.editorNew ? (
                    <SubmitReplyEditorNew
                        type="submit_story"
                        successCallback={this.success}
                        editorButton={SwitchButton}
                    />
                ) : (
                    <SubmitReplyEditor
                        type="submit_story"
                        successCallback={this.success}
                        editorButton={SwitchButton}
                    />
                )}
            </div>
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
