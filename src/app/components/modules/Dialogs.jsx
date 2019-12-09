import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import CloseButton from 'app/components/elements/CloseButton';
import Reveal from 'app/components/elements/Reveal';
import { Map, List } from 'immutable';
import * as globalActions from 'app/redux/GlobalReducer';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import QrReader from 'app/components/elements/QrReader';
import CheckLoginOwner from 'app/components/elements/CheckLoginOwner';
import PromotePost from 'app/components/modules/PromotePost';
import ExplorePost from 'app/components/modules/ExplorePost';
import CommunitySubscriberList from './CommunitySubscriberList';
import NotificationsList from '../cards/NotificationsList';

class Dialogs extends React.Component {
    static propTypes = {
        active_dialogs: PropTypes.object,
        hide: PropTypes.func.isRequired,
    };
    constructor() {
        super();
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Dialogs');
        this.hide = name => {
            this.props.hide(name);
        };
    }
    componentWillReceiveProps(nextProps) {
        const { active_dialogs, hide } = nextProps;
        active_dialogs.forEach((v, k) => {
            if (!this['hide_' + k]) this['hide_' + k] = () => hide(k);
        });
    }
    render() {
        const { active_dialogs } = this.props;
        let idx = 0;
        const dialogs = active_dialogs.reduce((r, v, k) => {
            console.log('r:', r.toJS(), 'v', v.toJS(), 'k:', k);
            const cmp =
                k === 'qr_reader' ? (
                    <span key={`dialog-${k}`}>
                        <Reveal
                            onHide={this['hide_' + k]}
                            show
                            revealStyle={{ width: '355px' }}
                        >
                            <CloseButton onClick={this['hide_' + k]} />
                            <QrReader
                                onClose={this['hide_' + k]}
                                {...v.get('params').toJS()}
                            />
                        </Reveal>
                    </span>
                ) : k === 'promotePost' ? (
                    <span key={`dialog-${k}`}>
                        <Reveal onHide={this['hide_' + k]} show>
                            <CloseButton onClick={this['hide_' + k]} />
                            <PromotePost
                                onClose={this['hide_' + k]}
                                {...v.get('params').toJS()}
                            />
                        </Reveal>
                    </span>
                ) : k === 'explorePost' ? (
                    <span key={`dialog-${k}`}>
                        <Reveal onHide={this['hide_' + k]} show>
                            <CloseButton onClick={this['hide_' + k]} />
                            <ExplorePost
                                onClick={this['hide_' + k]}
                                {...v.get('params').toJS()}
                            />
                        </Reveal>
                    </span>
                ) : k === 'communitySubscribers' ? (
                    <span key={`dialog-${k}`}>
                        <Reveal onHide={this['hide_' + k]} show>
                            <CloseButton onClick={this['hide_' + k]} />
                            <CommunitySubscriberList
                                onClick={this['hide_' + k]}
                                {...v.get('params').toJS()}
                            />
                        </Reveal>
                    </span>
                ) : k === 'communityModerationLog' ? (
                    <span key={`dialog-${k}`}>
                        <Reveal onHide={this['hide_' + k]} show>
                            <NotificationsList
                                username={v.getIn([
                                    'params',
                                    'community',
                                    'name',
                                ])}
                                isLastpage={true}
                            />
                        </Reveal>
                    </span>
                ) : null;
            return cmp ? r.push(cmp) : r;
        }, List());
        return (
            <div>
                {dialogs.toJS()}
                <CheckLoginOwner />
            </div>
        );
    }
}

const emptyMap = Map();

export default connect(
    state => {
        return {
            active_dialogs: state.global.get('active_dialogs') || emptyMap,
        };
    },
    dispatch => ({
        hide: name => {
            dispatch(globalActions.hideDialog({ name }));
        },
    })
)(Dialogs);
