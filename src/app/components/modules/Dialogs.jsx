import React from 'react';
import {connect} from 'react-redux';
import CloseButton from 'react-foundation-components/lib/global/close-button';
import Reveal from 'react-foundation-components/lib/global/reveal';
import {Map, List} from 'immutable'
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import QrReader from 'app/components/elements/QrReader'
import ConvertToSteem from 'app/components/elements/ConvertToSteem'
import SuggestPassword from 'app/components/elements/SuggestPassword'
import ChangePassword from 'app/components/elements/ChangePassword'
import CheckLoginOwner from 'app/components/elements/CheckLoginOwner'
import QrKeyView from 'app/components/elements/QrKeyView'
import PromotePost from 'app/components/modules/PromotePost';
import ExplorePost from 'app/components/modules/ExplorePost';

class Dialogs extends React.Component {
    static propTypes = {
        active_dialogs: React.PropTypes.object,
        hide: React.PropTypes.func.isRequired,
    }
    constructor() {
        super()
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Dialogs')
        this.hide = (name) => {
            this.props.hide(name)
        }
    }
    componentWillReceiveProps(nextProps) {
        const {active_dialogs, hide} = nextProps
        active_dialogs.forEach((v, k) => {
            if(!this['hide_' + k])
                this['hide_' + k] = () => hide(k)
        })
    }
    render() {
        const {active_dialogs} = this.props
        let idx = 0
        const dialogs = active_dialogs.reduce((r, v, k) => {
            const cmp = k === 'qr_reader' ? <span key={idx++} >
                <Reveal onHide={this['hide_' + k]} show revealStyle={{width: '355px'}} >
                    <CloseButton onClick={this['hide_' + k]} />
                    <QrReader onClose={this['hide_' + k]} {...v.get('params').toJS()} />
                </Reveal>
            </span>:
            k === 'convertToSteem' ? <span key={idx++} >
                <Reveal onHide={this['hide_' + k]} show revealStyle={{width: '450px'}} >
                    <CloseButton onClick={this['hide_' + k]} />
                    <ConvertToSteem onClose={this['hide_' + k]} />
                </Reveal>
            </span>:
            k === 'suggestPassword' ? <span key={idx++} >
                <Reveal onHide={this['hide_' + k]} show size="medium">
                    <CloseButton onClick={this['hide_' + k]} />
                    <SuggestPassword onClose={this['hide_' + k]} />
                </Reveal>
            </span>:
            k === 'changePassword' ? <span key={idx++} >
                <Reveal onHide={this['hide_' + k]} show>
                    <CloseButton onClick={this['hide_' + k]} />
                    <ChangePassword onClose={this['hide_' + k]} {...v.get('params').toJS()} />
                </Reveal>
            </span>:
            k === 'promotePost' ? <span key={idx++} >
                <Reveal onHide={this['hide_' + k]} show>
                    <CloseButton onClick={this['hide_' + k]} />
                    <PromotePost onClose={this['hide_' + k]} {...v.get('params').toJS()} />
                </Reveal>
            </span>:
            k === 'explorePost' ? <span key={idx++} >
                <Reveal onHide={this['hide_' + k]} show>
                    <CloseButton onClick={this['hide_' + k]} />
                    <ExplorePost onClick={this['hide_' + k]} {...v.get('params').toJS()} />
                </Reveal>
            </span>:
            k === 'qr_key' ? <span key={idx++} >
                <Reveal onHide={this['hide_' + k]} show>
                    <CloseButton onClick={this['hide_' + k]} />
                    <QrKeyView onClose={this['hide_' + k]} {...v.get('params').toJS()} />
                </Reveal>
            </span>:
            null
            return cmp ? r.push(cmp) : r
        }, List())
        return <div>
            {dialogs.toJS()}
            <CheckLoginOwner />
        </div>
    }
}

const emptyMap = Map()

export default connect(
    state => {
        return {
            active_dialogs: state.getIn(['global', 'active_dialogs']) || emptyMap,
        }
    },
    dispatch => ({
        hide: name => {
            dispatch({type: 'global/HIDE_DIALOG', payload: {name}})
        },
    })
)(Dialogs)
