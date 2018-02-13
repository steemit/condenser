import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import tt from 'counterpart';
import classnames from 'classnames';
import { memo } from '@steemit/steem-js';

class Memo extends React.Component {
    static propTypes = {
        text: PropTypes.string,
        username: PropTypes.string,
        isFromBadActor: PropTypes.bool.isRequired,
        // redux props
        myAccount: PropTypes.bool,
        memo_private: PropTypes.object,
    };

    constructor() {
        super();
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Memo');
        this.state = {
            revealBadActorMemo: false,
        };
    }

    decodeMemo(memo_private, text) {
        try {
            return memo.decode(memo_private, text);
        } catch (e) {
            console.error('memo decryption error', text, e);
            return 'Invalid memo';
        }
    }

    onRevealBadActorMemo = e => {
        e.preventDefault();
        this.setState({ revealBadActorMemo: true });
    };

    render() {
        const { decodeMemo } = this;
        const { memo_private, text, myAccount, isFromBadActor } = this.props;
        const isEncoded = /^#/.test(text);

        const classes = classnames({
            Memo: true,
            'Memo--badActor': isFromBadActor,
            'Memo--private': memo_private,
        });

        let renderText = '';

        if (!isEncoded) {
            renderText = text;
        } else if (memo_private) {
            renderText = myAccount
                ? decodeMemo(memo_private, text)
                : tt('g.login_to_see_memo');
        }

        if (isFromBadActor && !this.state.revealBadActorMemo) {
            renderText = (
                <div className="bad-actor-warning">
                    <div className="bad-actor-caution">
                        {tt('transferhistoryrow_jsx.bad_actor_caution')}
                    </div>
                    <div className="bad-actor-explained">
                        {tt('transferhistoryrow_jsx.bad_actor_explained')}
                    </div>
                    <div
                        className="ptc bad-actor-reveal-memo"
                        role="button"
                        onClick={this.onRevealBadActorMemo}
                    >
                        {tt('transferhistoryrow_jsx.bad_actor_reveal_memo')}
                    </div>
                </div>
            );
        }

        return <span className={classes}>{renderText}</span>;
    }
}

export default connect((state, ownProps) => {
    const currentUser = state.user.get('current');
    const myAccount =
        currentUser && ownProps.username === currentUser.get('username');
    const memo_private =
        myAccount && currentUser
            ? currentUser.getIn(['private_keys', 'memo_private'])
            : null;
    return { ...ownProps, memo_private, myAccount };
})(Memo);
