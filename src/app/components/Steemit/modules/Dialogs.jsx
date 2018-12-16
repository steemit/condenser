import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import CloseButton from 'app/components/Steemit/elements/CloseButton';
import Reveal from 'app/components/Steemit/elements/Reveal';
import { Map, List } from 'immutable';
import * as globalActions from 'app/redux/GlobalReducer';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import QrReader from 'app/components/Steemit/elements/QrReader';
import ConvertToSteem from 'app/components/Steemit/elements/ConvertToSteem';
import SuggestPassword from 'app/components/Steemit/elements/SuggestPassword';
import ChangePassword from 'app/components/Steemit/elements/ChangePassword';
import CheckLoginOwner from 'app/components/Steemit/elements/CheckLoginOwner';
import QrKeyView from 'app/components/Steemit/elements/QrKeyView';
import PromotePost from 'app/components/Steemit/modules/PromotePost';
import ExplorePost from 'app/components/Steemit/modules/ExplorePost';

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
            const cmp =
                k === 'qr_reader' ? (
                    <span key={idx++}>
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
                ) : k === 'convertToSteem' ? (
                    <span key={idx++}>
                        <Reveal
                            onHide={this['hide_' + k]}
                            show
                            revealStyle={{ width: '450px' }}
                        >
                            <CloseButton onClick={this['hide_' + k]} />
                            <ConvertToSteem onClose={this['hide_' + k]} />
                        </Reveal>
                    </span>
                ) : k === 'suggestPassword' ? (
                    <span key={idx++}>
                        <Reveal onHide={this['hide_' + k]} show size="medium">
                            <CloseButton onClick={this['hide_' + k]} />
                            <SuggestPassword onClose={this['hide_' + k]} />
                        </Reveal>
                    </span>
                ) : k === 'changePassword' ? (
                    <span key={idx++}>
                        <Reveal onHide={this['hide_' + k]} show>
                            <CloseButton onClick={this['hide_' + k]} />
                            <ChangePassword
                                onClose={this['hide_' + k]}
                                {...v.get('params').toJS()}
                            />
                        </Reveal>
                    </span>
                ) : k === 'promotePost' ? (
                    <span key={idx++}>
                        <Reveal onHide={this['hide_' + k]} show>
                            <CloseButton onClick={this['hide_' + k]} />
                            <PromotePost
                                onClose={this['hide_' + k]}
                                {...v.get('params').toJS()}
                            />
                        </Reveal>
                    </span>
                ) : k === 'explorePost' ? (
                    <span key={idx++}>
                        <Reveal onHide={this['hide_' + k]} show>
                            <CloseButton onClick={this['hide_' + k]} />
                            <ExplorePost
                                onClick={this['hide_' + k]}
                                {...v.get('params').toJS()}
                            />
                        </Reveal>
                    </span>
                ) : k === 'qr_key' ? (
                    <span key={idx++}>
                        <Reveal onHide={this['hide_' + k]} show>
                            <CloseButton onClick={this['hide_' + k]} />
                            <QrKeyView
                                onClose={this['hide_' + k]}
                                {...v.get('params').toJS()}
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