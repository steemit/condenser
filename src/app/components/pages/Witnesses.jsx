import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import links from 'app/utils/Links';
import Icon from 'app/components/elements/Icon';
import * as transactionActions from 'app/redux/TransactionReducer';
import ByteBuffer from 'bytebuffer';
import { is, Set, List } from 'immutable';
import * as globalActions from 'app/redux/GlobalReducer';
import tt from 'counterpart';

const Long = ByteBuffer.Long;
const { string, func, object } = PropTypes;

const DISABLED_SIGNING_KEY = 'STM1111111111111111111111111111111114T1Anm';

function _blockGap(head_block, last_block) {
    if (!last_block || last_block < 1) return 'forever';
    const secs = (head_block - last_block) * 3;
    if (secs < 120) return 'recently';
    const mins = Math.floor(secs / 60);
    if (mins < 120) return mins + ' mins ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 48) return hrs + ' hrs ago';
    const days = Math.floor(hrs / 24);
    if (days < 14) return days + ' days ago';
    const weeks = Math.floor(days / 7);
    if (weeks < 104) return weeks + ' weeks ago';
}

class Witnesses extends React.Component {
    static propTypes = {
        // HTML properties

        // Redux connect properties
        witnesses: object.isRequired,
        accountWitnessVote: func.isRequired,
        username: string,
        witness_votes: object,
    };

    constructor() {
        super();
        this.state = { customUsername: '', proxy: '', proxyFailed: false };
        this.accountWitnessVote = (accountName, approve, e) => {
            e.preventDefault();
            const { username, accountWitnessVote } = this.props;
            this.setState({ customUsername: '' });
            accountWitnessVote(username, accountName, approve);
        };
        this.onWitnessChange = e => {
            const customUsername = e.target.value;
            this.setState({ customUsername });
            // Force update to ensure witness vote appears
            this.forceUpdate();
        };
        this.accountWitnessProxy = e => {
            e.preventDefault();
            const { username, accountWitnessProxy } = this.props;
            accountWitnessProxy(username, this.state.proxy, state => {
                this.setState(state);
            });
        };
    }

    shouldComponentUpdate(np, ns) {
        return (
            !is(np.witness_votes, this.props.witness_votes) ||
            !is(np.witnessVotesInProgress, this.props.witnessVotesInProgress) ||
            np.witnesses !== this.props.witnesses ||
            np.current_proxy !== this.props.current_proxy ||
            np.username !== this.props.username ||
            ns.customUsername !== this.state.customUsername ||
            ns.proxy !== this.state.proxy ||
            ns.proxyFailed !== this.state.proxyFailed
        );
    }

    render() {
        const {
            props: {
                witness_votes,
                witnessVotesInProgress,
                current_proxy,
                head_block,
            },
            state: { customUsername, proxy },
            accountWitnessVote,
            accountWitnessProxy,
            onWitnessChange,
        } = this;
        const sorted_witnesses = this.props.witnesses.sort((a, b) =>
            Long.fromString(String(b.get('votes'))).subtract(
                Long.fromString(String(a.get('votes'))).toString()
            )
        );
        let witness_vote_count = 30;
        let rank = 1;

        const witnesses = sorted_witnesses.map(item => {
            const owner = item.get('owner');
            const thread = item.get('url');
            const myVote = witness_votes ? witness_votes.has(owner) : null;
            const signingKey = item.get('signing_key');
            const isDisabled = signingKey == DISABLED_SIGNING_KEY;
            const lastBlock = item.get('last_confirmed_block_num');
            const votingActive = witnessVotesInProgress.has(owner);
            const classUp =
                'Voting__button Voting__button-up' +
                (myVote === true ? ' Voting__button--upvoted' : '') +
                (votingActive ? ' votingUp' : '');
            const up = (
                <Icon
                    name={votingActive ? 'empty' : 'chevron-up-circle'}
                    className="upvote"
                />
            );

            let witness_thread = '';
            if (thread) {
                if (links.remote.test(thread)) {
                    witness_thread = (
                        <a href={thread}>
                            {tt('witnesses_jsx.external_site')}&nbsp;<Icon name="extlink" />
                        </a>
                    );
                } else {
                    witness_thread = (
                        <Link to={thread}>
                            {tt('witnesses_jsx.witness_thread')}
                        </Link>
                    );
                }
            }

            const ownerStyle = isDisabled
                ? { textDecoration: 'line-through', color: '#AAA' }
                : {};

            return (
                <tr key={owner}>
                    <td width="75">
                        {rank < 10 && '0'}
                        {rank++}
                        &nbsp;&nbsp;
                        <span className={classUp}>
                            {votingActive ? (
                                up
                            ) : (
                                <a
                                    href="#"
                                    onClick={accountWitnessVote.bind(
                                        this,
                                        owner,
                                        !myVote
                                    )}
                                    title={myVote === true ? tt('g.remove_vote') : tt('g.vote')}
                                >
                                    {up}
                                </a>
                            )}
                        </span>
                    </td>
                    <td>
                        <Link to={'/@' + owner} style={ownerStyle}>
                            {owner}
                        </Link>
                        {isDisabled && (
                            <small>
                                {' '}
                                ({tt('witnesses_jsx.disabled')}{' '}
                                {_blockGap(head_block, lastBlock)})
                            </small>
                        )}
                    </td>
                    <td>{witness_thread}</td>
                </tr>
            );
        });

        let addl_witnesses = false;
        if (witness_votes) {
            witness_vote_count -= witness_votes.size;
            addl_witnesses = witness_votes
                .union(witnessVotesInProgress)
                .filter(item => {
                    return !sorted_witnesses.has(item);
                })
                .map(item => {
                    const votingActive = witnessVotesInProgress.has(item);
                    const classUp =
                        'Voting__button Voting__button-up' +
                        (votingActive
                            ? ' votingUp'
                            : ' Voting__button--upvoted');
                    const up = (
                        <Icon
                            name={votingActive ? 'empty' : 'chevron-up-circle'}
                            className="upvote"
                        />
                    );
                    return (
                        <div className="row" key={item}>
                            <div className="column small-12">
                                <span>
                                    {/*className="Voting"*/}
                                    <span className={classUp}>
                                        {votingActive ? (
                                            up
                                        ) : (
                                            <a
                                                href="#"
                                                onClick={accountWitnessVote.bind(
                                                    this,
                                                    item,
                                                    false
                                                )}
                                                title={tt('g.remove_vote')}
                                            >
                                                {up}
                                            </a>
                                        )}
                                        &nbsp;
                                    </span>
                                </span>
                                <Link to={'/@' + item}>{item}</Link>
                            </div>
                        </div>
                    );
                })
                .toArray();
        }

        return (
            <div className="Witnesses">
                <div className="row">
                    <div className="column">
                        <h2>{tt('witnesses_jsx.top_witnesses')}</h2>
                        {current_proxy && current_proxy.length ? null : (
                            <p>
                                <strong>
                                    {tt(
                                        'witnesses_jsx.you_have_votes_remaining',
                                        { count: witness_vote_count }
                                    )}.
                                </strong>{' '}
                                {tt(
                                    'witnesses_jsx.you_can_vote_for_maximum_of_witnesses'
                                )}.
                            </p>
                        )}
                    </div>
                </div>
                {current_proxy ? null : (
                    <div className="row small-collapse">
                        <div className="column">
                            <table>
                                <thead>
                                    <tr>
                                        <th />
                                        <th>{tt('witnesses_jsx.witness')}</th>
                                        <th>
                                            {tt('witnesses_jsx.information')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>{witnesses.toArray()}</tbody>
                            </table>
                        </div>
                    </div>
                )}

                {current_proxy ? null : (
                    <div className="row">
                        <div className="column">
                            <p>
                                {tt(
                                    'witnesses_jsx.if_you_want_to_vote_outside_of_top_enter_account_name'
                                )}.
                            </p>
                            <form>
                                <div className="input-group">
                                    <span className="input-group-label">@</span>
                                    <input
                                        className="input-group-field"
                                        type="text"
                                        style={{
                                            float: 'left',
                                            width: '75%',
                                            maxWidth: '20rem',
                                        }}
                                        value={customUsername}
                                        onChange={onWitnessChange}
                                    />
                                    <div className="input-group-button">
                                        <button
                                            className="button"
                                            onClick={accountWitnessVote.bind(
                                                this,
                                                customUsername,
                                                !(witness_votes
                                                    ? witness_votes.has(
                                                          customUsername
                                                      )
                                                    : null)
                                            )}
                                        >
                                            {tt('g.vote')}
                                        </button>
                                    </div>
                                </div>
                            </form>
                            <br />
                            {addl_witnesses}
                            <br />
                            <br />
                        </div>
                    </div>
                )}

                <div className="row">
                    <div className="column">
                        <p>
                            {current_proxy
                                ? tt('witnesses_jsx.witness_set')
                                : tt('witnesses_jsx.set_witness_proxy')}
                        </p>
                        {current_proxy ? (
                            <div>
                                <div style={{ paddingBottom: 10 }}>
                                    {tt('witnesses_jsx.witness_proxy_current')}:{' '}
                                    <strong>{current_proxy}</strong>
                                </div>

                                <form>
                                    <div className="input-group">
                                        <input
                                            className="input-group-field bold"
                                            disabled
                                            type="text"
                                            style={{
                                                float: 'left',
                                                width: '75%',
                                                maxWidth: '20rem',
                                            }}
                                            value={current_proxy}
                                        />
                                        <div className="input-group-button">
                                            <button
                                                style={{ marginBottom: 0 }}
                                                className="button"
                                                onClick={accountWitnessProxy}
                                            >
                                                {tt(
                                                    'witnesses_jsx.witness_proxy_clear'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <form>
                                <div className="input-group">
                                    <span className="input-group-label">@</span>
                                    <input
                                        className="input-group-field bold"
                                        type="text"
                                        style={{
                                            float: 'left',
                                            width: '75%',
                                            maxWidth: '20rem',
                                        }}
                                        value={proxy}
                                        onChange={e => {
                                            this.setState({
                                                proxy: e.target.value,
                                            });
                                        }}
                                    />
                                    <div className="input-group-button">
                                        <button
                                            style={{ marginBottom: 0 }}
                                            className="button"
                                            onClick={accountWitnessProxy}
                                        >
                                            {tt(
                                                'witnesses_jsx.witness_proxy_set'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                        {this.state.proxyFailed && (
                            <p className="error">
                                {tt('witnesses_jsx.proxy_update_error')}.
                            </p>
                        )}
                        <br />
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: '/~witnesses(/:witness)',
    component: connect(
        state => {
            const current_user = state.user.get('current');
            const username = current_user && current_user.get('username');
            const current_account =
                current_user && state.global.getIn(['accounts', username]);
            const witness_votes =
                current_account && current_account.get('witness_votes').toSet();
            const current_proxy =
                current_account && current_account.get('proxy');
            const witnesses = state.global.get('witnesses', List());
            const witnessVotesInProgress = state.global.get(
                `transaction_witness_vote_active_${username}`,
                Set()
            );
            return {
                head_block: state.global.getIn(['props', 'head_block_number']),
                witnesses,
                username,
                witness_votes,
                witnessVotesInProgress,
                current_proxy,
            };
        },
        dispatch => {
            return {
                accountWitnessVote: (username, witness, approve) => {
                    dispatch(
                        transactionActions.broadcastOperation({
                            type: 'account_witness_vote',
                            operation: { account: username, witness, approve },
                            confirm: !approve
                                ? 'You are about to remove your vote for this witness'
                                : null
                        })
                    );
                },
                accountWitnessProxy: (account, proxy, stateCallback) => {
                    dispatch(
                        transactionActions.broadcastOperation({
                            type: 'account_witness_proxy',
                            operation: { account, proxy },
                            confirm: proxy.length
                                ? 'Set proxy to: ' + proxy
                                : 'You are about to remove your proxy.',
                            successCallback: () => {
                                dispatch(
                                    globalActions.updateAccountWitnessProxy({
                                        account,
                                        proxy,
                                    })
                                );
                                stateCallback({
                                    proxyFailed: false,
                                    proxy: '',
                                });
                            },
                            errorCallback: e => {
                                console.log('error:', e);
                                stateCallback({ proxyFailed: true });
                            },
                        })
                    );
                },
            };
        }
    )(Witnesses),
};
