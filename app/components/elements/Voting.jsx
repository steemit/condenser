import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import transaction from 'app/redux/Transaction';
import user from 'app/redux/User';
import Slider from 'react-rangeslider';
import Icon from 'app/components/elements/Icon';
import { parsePayoutAmount } from 'app/utils/ParsersAndFormatters';
import DropdownMenu from 'app/components/elements/DropdownMenu';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import FoundationDropdown from 'app/components/elements/FoundationDropdown';
import CloseButton from 'react-foundation-components/lib/global/close-button';
import tt from 'counterpart';
import LocalizedCurrency, { localizedCurrency } from 'app/components/elements/LocalizedCurrency';
import { DEBT_TICKER } from 'app/client_config';
import { getPayout } from 'src/app/helpers/currency';

const MAX_VOTES_DISPLAY = 20;
const VOTE_WEIGHT_DROPDOWN_THRESHOLD = 1000 * 1000;

class Voting extends PureComponent {
    static propTypes = {
        // HTML properties
        post: PropTypes.string.isRequired,
        flag: PropTypes.bool,
        showList: PropTypes.bool,

        // Redux connect properties
        vote: PropTypes.func.isRequired,
        author: PropTypes.string,
        permlink: PropTypes.string,
        username: PropTypes.string,
        isComment: PropTypes.bool,
        activeVotes: PropTypes.object,
        postData: PropTypes.object,
        netVestingShares: PropTypes.number,
        voting: PropTypes.bool,
    };

    static defaultProps = {
        showList: true,
        flag: false,
    };

    constructor(props) {
        super(props);

        this.state = {
            showWeight: false,
            myVote: null,
            weight: 10000,
        };
    }

    componentDidMount() {
        const { username, activeVotes } = this.props;

        this._checkMyVote(username, activeVotes);
    }

    componentWillReceiveProps(nextProps) {
        const { username, activeVotes } = nextProps;

        this._checkMyVote(username, activeVotes);
    }

    _checkMyVote(username, activeVotes) {
        if (username && activeVotes) {
            const vote = activeVotes.find(el => el.get('voter') === username);

            // weight warning, the API may send a string or a number (when zero)
            if (vote) {
                this.setState({
                    myVote: parseInt(vote.get('percent') || 0, 10),
                });
            }
        }
    }

    render() {
        const {
            activeVotes,
            showList,
            voting,
            flag,
            netVestingShares,
            isComment,
            postData,
            username,
        } = this.props;

        const { votingUp, votingDown, showWeight, weight, myVote } = this.state;

        if (flag && !username) {
            return null;
        }

        const votingUpActive = voting && votingUp;
        const votingDownActive = voting && votingDown;

        const ABOUT_FLAG = (
            <div>
                <p>
                    {tt(
                        'voting_jsx.flagging_post_can_remove_rewards_the_flag_should_be_used_for_the_following'
                    )}:
                </p>
                <ul>
                    <li>{tt('voting_jsx.disagreement_on_rewards')}</li>
                    <li>{tt('voting_jsx.fraud_or_plagiarism')}</li>
                    <li>{tt('voting_jsx.hate_speech_or_internet_trolling')}</li>
                    <li>{tt('voting_jsx.intentional_miss_categorized_content_or_spam')}</li>
                </ul>
            </div>
        );

        if (flag) {
            const down = (
                <Icon name={votingDownActive ? 'empty' : myVote < 0 ? 'flag2' : 'flag1'} />
            );
            const classDown =
                'Voting__button Voting__button-down' +
                (myVote < 0 ? ' Voting__button--downvoted' : '') +
                (votingDownActive ? ' votingDown' : '');
            const flagWeight = postData.getIn(['stats', 'flagWeight']);

            // myVote === current vote
            const dropdown = (
                <FoundationDropdown
                    show={showWeight}
                    onHide={() => this.setState({ showWeight: false })}
                    className="Voting__adjust_weight_down"
                >
                    {(myVote == null || myVote === 0) &&
                        netVestingShares > VOTE_WEIGHT_DROPDOWN_THRESHOLD && (
                            <div>
                                <div className="weight-display">- {weight / 100}%</div>
                                <Slider
                                    min={100}
                                    max={10000}
                                    step={100}
                                    value={weight}
                                    onChange={this._handleWeightChange}
                                />
                            </div>
                        )}
                    <CloseButton onClick={() => this.setState({ showWeight: false })} />
                    <div className="clear Voting__about-flag">
                        <p>{ABOUT_FLAG}</p>
                        <a
                            href="#"
                            onClick={this._voteDown}
                            className="button outline"
                            title={tt('g.flag')}
                        >
                            {tt('g.flag')}
                        </a>
                    </div>
                </FoundationDropdown>
            );

            const flagClickAction =
                myVote === null || myVote === 0 ? this._toggleWeightDown : this._voteDown;

            return (
                <span className="Voting">
                    <span className={classDown}>
                        {flagWeight > 0 && (
                            <span className="Voting__button-downvotes">
                                {'•'.repeat(flagWeight)}
                            </span>
                        )}
                        {votingDownActive ? (
                            down
                        ) : (
                            <a href="#" onClick={flagClickAction} title={tt('g.flag')}>
                                {down}
                            </a>
                        )}
                        {dropdown}
                    </span>
                </span>
            );
        }

        const totalVotes = postData.getIn(['stats', 'total_votes']);

        const cashOutTime = postData.get('cashout_time');
        const max_payout = parsePayoutAmount(postData.get('max_accepted_payout'));
        const promoted = parsePayoutAmount(postData.get('promoted'));

        const pending_payout = parsePayoutAmount(postData.get('pending_payout_value'));
        const total_author_payout = parsePayoutAmount(postData.get('total_payout_value'));
        const total_curator_payout = parsePayoutAmount(postData.get('curator_payout_value'));

        const up = <Icon name={votingUpActive ? 'empty' : 'chevron-up-circle'} />;
        const classUp =
            'Voting__button Voting__button-up' +
            (myVote > 0 ? ' Voting__button--upvoted' : '') +
            (votingUpActive ? ' votingUp' : '');

        // There is an "active cashout" if: (a) there is a pending payout, OR (b) there is a valid cashout_time AND it's NOT a comment with 0 votes.
        const cashout_active =
            pending_payout > 0 ||
            (cashOutTime.indexOf('1969') !== 0 && !(isComment && totalVotes == 0));
        const payoutItems = [];

        if (cashout_active) {
            payoutItems.push({
                value:
                    tt('voting_jsx.potential_payout') +
                    ' ' +
                    localizedCurrency(pending_payout) +
                    ' (' +
                    pending_payout.toFixed(3) +
                    ' ' +
                    DEBT_TICKER +
                    ')',
            });
        }

        if (promoted > 0) {
            payoutItems.push({
                value: tt('voting_jsx.boost_payments') + ' ' + localizedCurrency(promoted),
            });
        }

        if (cashout_active) {
            payoutItems.push({ value: <TimeAgoWrapper date={cashOutTime} /> });
        }

        if (max_payout == 0) {
            payoutItems.push({ value: tt('voting_jsx.payouts_declined') });
        } else if (max_payout < 1000000) {
            payoutItems.push({
                value: tt('voting_jsx.max_accepted_payout') + localizedCurrency(max_payout),
            });
        }

        if (total_author_payout > 0) {
            payoutItems.push({
                value:
                    tt('voting_jsx.past_payouts') +
                    ' ' +
                    localizedCurrency(total_author_payout + total_curator_payout),
            });

            payoutItems.push({
                value:
                    ' - ' +
                    tt('voting_jsx.authors') +
                    ': ' +
                    localizedCurrency(total_author_payout),
            });

            payoutItems.push({
                value:
                    ' - ' +
                    tt('voting_jsx.curators') +
                    ': ' +
                    localizedCurrency(total_curator_payout),
            });
        }

        const payoutEl = (
            <DropdownMenu el="div" items={payoutItems}>
                <span>
                    {getPayout(postData)}
                    {payoutItems.length > 0 && <Icon name="dropdown-arrow" />}
                </span>
            </DropdownMenu>
        );

        let votersList = null;

        if (showList && totalVotes > 0 && activeVotes) {
            const avotes = activeVotes.toJS();

            avotes.sort(
                (a, b) => (Math.abs(parseInt(a.rshares)) > Math.abs(parseInt(b.rshares)) ? -1 : 1)
            );

            let voters = [];

            for (let v = 0; v < avotes.length && voters.length < MAX_VOTES_DISPLAY; ++v) {
                const { percent, voter } = avotes[v];
                const sign = Math.sign(percent);
                const voterPercent = percent / 100 + '%';

                if (sign === 0) {
                    continue;
                }

                voters.push({
                    value: (sign > 0 ? '+ ' : '- ') + voter,
                    link: '/@' + voter,
                    data: voterPercent,
                });
            }

            if (totalVotes > voters.length) {
                voters.push({
                    value: (
                        <span>
                            &hellip; {tt('g.and')} {totalVotes - voters.length} {tt('g.more')}
                        </span>
                    ),
                });
            }

            votersList = (
                <DropdownMenu
                    selected={tt('votesandcomments_jsx.vote_count', { count: totalVotes })}
                    className="Voting__voters_list"
                    items={voters}
                    el="div"
                />
            );
        }

        let voteUpClick = this._voteUp;
        let dropdown = null;

        if (myVote <= 0 && netVestingShares > VOTE_WEIGHT_DROPDOWN_THRESHOLD) {
            voteUpClick = this._toggleWeightUp;

            dropdown = (
                <FoundationDropdown
                    show={showWeight}
                    onHide={() => this.setState({ showWeight: false })}
                >
                    <div className="Voting__adjust_weight row align-middle collapse">
                        <a
                            href="#"
                            onClick={this._voteUp}
                            className="columns small-2 confirm_weight"
                            title={tt('g.upvote')}
                        >
                            <Icon size="2x" name="chevron-up-circle" />
                        </a>
                        <div className="columns small-2 weight-display">{weight / 100}%</div>
                        <Slider
                            min={100}
                            max={10000}
                            step={100}
                            value={weight}
                            className="columns small-6"
                            onChange={this._handleWeightChange}
                        />
                        <CloseButton
                            className="columns small-2 Voting__adjust_weight_close"
                            onClick={() => this.setState({ showWeight: false })}
                        />
                    </div>
                </FoundationDropdown>
            );
        }

        return (
            <span className="Voting">
                <span className="Voting__inner">
                    <span className={classUp}>
                        {votingUpActive ? (
                            up
                        ) : (
                            <a
                                href="#"
                                onClick={voteUpClick}
                                title={tt(myVote > 0 ? 'g.remove_vote' : 'g.upvote')}
                            >
                                {up}
                            </a>
                        )}
                        {dropdown}
                    </span>
                    {payoutEl}
                </span>
                {votersList}
            </span>
        );
    }

    _voteUp = e => {
        e.preventDefault();
        this._voteUpOrDown(true);
    };

    _voteDown = e => {
        e.preventDefault();
        this._voteUpOrDown(false);
    };

    _voteUpOrDown = up => {
        if (this.props.voting) {
            return;
        }

        this.setState({
            votingUp: up,
            votingDown: !up,
        });

        const { myVote } = this.state;
        const { author, permlink, username, isComment, netVestingShares } = this.props;

        if (netVestingShares > VOTE_WEIGHT_DROPDOWN_THRESHOLD) {
            localStorage.setItem(
                'voteWeight' + (up ? '' : 'Down') + '-' + username + (isComment ? '-comment' : ''),
                this.state.weight
            );
        }

        // already voted Up, remove the vote
        const weight = up
            ? myVote > 0
                ? 0
                : this.state.weight
            : myVote < 0
                ? 0
                : -1 * this.state.weight;

        if (this.state.showWeight) {
            this.setState({ showWeight: false });
        }

        this.props.vote(weight, { author, permlink, username, myVote });
    };

    _handleWeightChange = weight => {
        this.setState({ weight });
    };

    _toggleWeightUp = e => {
        e.preventDefault();
        this._toggleWeightUpOrDown(true);
    };

    _toggleWeightDown = e => {
        e.preventDefault();
        this._toggleWeightUpOrDown(false);
    };

    _toggleWeightUpOrDown = up => {
        const { username, isComment } = this.props;
        // Upon opening dialog, read last used weight (this works accross tabs)
        if (!this.state.showWeight) {
            localStorage.removeItem('vote_weight'); // deprecated. remove this line after 8/31

            const saved_weight = localStorage.getItem(
                'voteWeight' + (up ? '' : 'Down') + '-' + username + (isComment ? '-comment' : '')
            );

            this.setState({
                weight: saved_weight ? parseInt(saved_weight, 10) : 10000,
            });
        }
        this.setState({
            showWeight: !this.state.showWeight,
        });
    };
}

export default connect(
    (state, props) => {
        const post = state.global.getIn(['content', props.post]);

        if (!post) {
            return;
        }

        const author = post.get('author');
        const permlink = post.get('permlink');
        const activeVotes = post.get('active_votes');
        const isComment = post.get('parent_author') !== '';

        const current_account = state.user.get('current');
        const username = current_account ? current_account.get('username') : null;
        const vestingShares = current_account ? current_account.get('vesting_shares') : 0;
        const delegated_vesting_shares = current_account
            ? current_account.get('delegated_vesting_shares')
            : 0;
        const receivedVestingShares = current_account
            ? current_account.get('received_vesting_shares')
            : 0;
        const netVestingShares = vestingShares - delegated_vesting_shares + receivedVestingShares;
        const voting = state.global.get(`transaction_vote_active_${author}_${permlink}`);

        return {
            author,
            permlink,
            username,
            activeVotes,
            netVestingShares,
            isComment,
            postData: post,
            voting,
        };
    },

    dispatch => ({
        vote: (weight, { author, permlink, username, myVote }) => {
            const confirm = () => {
                if (myVote == null) {
                    return;
                }

                const t = tt('voting_jsx.we_will_reset_curation_rewards_for_this_post');

                if (weight === 0) {
                    return tt('voting_jsx.removing_your_vote') + t;
                }

                if (weight > 0) {
                    return tt('voting_jsx.changing_to_an_upvote') + t;
                }

                if (weight < 0) {
                    return tt('voting_jsx.changing_to_a_downvote') + t;
                }

                return null;
            };

            dispatch(
                transaction.actions.broadcastOperation({
                    type: 'vote',
                    operation: {
                        voter: username,
                        author,
                        permlink,
                        weight,
                        __config: { title: weight < 0 ? tt('voting_jsx.confirm_flag') : null },
                    },
                    confirm,
                    successCallback: () => dispatch(user.actions.getAccount()),
                })
            );
        },
    })
)(Voting);
