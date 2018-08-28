import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';

import g from 'app/redux/GlobalReducer';

import CloseButton from 'react-foundation-components/lib/global/close-button';
import Reveal from 'react-foundation-components/lib/global/reveal';

import CheckLoginOwner from 'app/components/elements/CheckLoginOwner';
import PromotePost from 'app/components/modules/PromotePost';
import ExplorePost from 'app/components/modules/ExplorePost';
import QrKeyView from 'app/components/elements/QrKeyView';

class Dialogs extends Component {

    static propTypes = {
        active_dialogs: PropTypes.object,
        hide: PropTypes.func.isRequired,
    };

    componentWillReceiveProps(nextProps) {
        const { active_dialogs, hide } = nextProps;
        active_dialogs.forEach((v, k) => {
            if (!this['hide_' + k]) this['hide_' + k] = () => hide(k);
        });
    }

    hide = name => {
        this.props.hide(name);
    };

    render() {
        const { active_dialogs } = this.props;
        let idx = 0;

        const dialogs = [];

        active_dialogs.forEach((v, k) => {
            if (k === 'promotePost') {
                dialogs.push(
                    <span key={idx++}>
                        <Reveal onHide={this['hide_' + k]} show>
                            <CloseButton onClick={this['hide_' + k]} />
                            <PromotePost onClose={this['hide_' + k]} {...v.get('params').toJS()} />
                        </Reveal>
                    </span>
                );
            } else if (k === 'explorePost') {
                dialogs.push(
                    <span key={idx++}>
                        <Reveal onHide={this['hide_' + k]} show>
                            <CloseButton onClick={this['hide_' + k]} />
                            <ExplorePost onClick={this['hide_' + k]} {...v.get('params').toJS()} />
                        </Reveal>
                    </span>
                );
            } else if (k === 'qr_key') {
                dialogs.push(
                    <span key={idx++}>
                        <Reveal onHide={this['hide_' + k]} show>
                            <CloseButton onClick={this['hide_' + k]} />
                            <QrKeyView onClose={this['hide_' + k]} {...v.get('params').toJS()} />
                        </Reveal>
                    </span>
                );
            }
        });

        return (
            <div>
                {dialogs}
                <CheckLoginOwner />
            </div>
        );
    }
}

const emptyMap = Map();

export default connect(
    state => ({
        active_dialogs: state.global.get('active_dialogs') || emptyMap,
    }),
    {
        hide: name => g.actions.hideDialog({ name }),
    }
)(Dialogs);
