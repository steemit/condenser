import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Slider from 'react-rangeslider';
import tt from 'counterpart';
import CloseButton from 'app/components/elements/CloseButton';
import * as transactionActions from 'app/redux/TransactionReducer';
import Icon from 'app/components/elements/Icon';
import {
    DEBT_TOKEN_SHORT,
    LIQUID_TOKEN_UPPERCASE,
    INVEST_TOKEN_SHORT,
} from 'app/client_config';
import FormattedAsset from 'app/components/elements/FormattedAsset';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import {
    formatDecimal,
    parsePayoutAmount,
} from 'app/utils/ParsersAndFormatters';
import DropdownMenu from 'app/components/elements/DropdownMenu';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import Dropdown from 'app/components/elements/Dropdown';

const ABOUT_FLAG = (
    <div>
        <p>
            {tt(
                'voting_jsx.flagging_post_can_remove_rewards_the_flag_should_be_used_for_the_following'
            )}
        </p>
        <ul>
            <li>{tt('voting_jsx.disagreement_on_rewards')}</li>
            <li>{tt('voting_jsx.fraud_or_plagiarism')}</li>
            <li>{tt('voting_jsx.hate_speech_or_internet_trolling')}</li>
            <li>
                {tt('voting_jsx.intentional_miss_categorized_content_or_spam')}
            </li>
        </ul>
    </div>
);

const MAX_VOTES_DISPLAY = 20;
const VOTE_WEIGHT_DROPDOWN_THRESHOLD = 1.0 * 1000.0 * 1000.0;
const SBD_PRINT_RATE_MAX = 10000;
const MAX_WEIGHT = 10000;

class Voting extends React.Component {
    static propTypes = {
        // HTML properties
        post: PropTypes.string.isRequired,
        flag: PropTypes.bool,
        showList: PropTypes.bool,

        // Redux connect properties
        vote: PropTypes.func.isRequired,
        author: PropTypes.string, // post was deleted
        permlink: PropTypes.string,
        username: PropTypes.string,
        is_comment: PropTypes.bool,
        active_votes: PropTypes.object,
        loggedin: PropTypes.bool,
        post_obj: PropTypes.object,
        enable_slider: PropTypes.bool,
        voting: PropTypes.bool,
        price_per_steem: PropTypes.number,
        sbd_print_rate: PropTypes.number,
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
            sliderWeight: {
                up: MAX_WEIGHT,
                down: MAX_WEIGHT,
            },
        };

        this.voteUp = e => {
            e && e.preventDefault();
            this.voteUpOrDown(true);
        };
        this.voteDown = e => {
            e && e.preventDefault();
            this.voteUpOrDown(false);
        };
        this.voteUpOrDown = up => {
            if (this.props.voting) return;
            this.setState({ votingUp: up, votingDown: !up });
            if (this.state.showWeight) this.setState({ showWeight: false });
            const { myVote } = this.state;
            const { author, permlink, username, is_comment } = this.props;

            let weight;
            if (myVote > 0 || myVote < 0) {
                // if there is a current vote, we're clearing it
                weight = 0;
            } else if (this.props.enable_slider) {
                // if slider is enabled, read its value
                weight = up
                    ? this.state.sliderWeight.up
                    : -this.state.sliderWeight.down;
            } else {
                // otherwise, use max power
                weight = up ? MAX_WEIGHT : -MAX_WEIGHT;
            }

            const isFlag = this.props.flag ? true : null;
            this.props.vote(weight, {
                author,
                permlink,
                username,
                myVote,
                isFlag,
            });
        };

        this.handleWeightChange = up => weight => {
            let w;
            if (up) {
                w = {
                    up: weight,
                    down: this.state.sliderWeight.down,
                };
            } else {
                w = {
                    up: this.state.sliderWeight.up,
                    down: weight,
                };
            }
            this.setState({ sliderWeight: w });
        };

        this.storeSliderWeight = up => () => {
            const { username, is_comment } = this.props;
            const weight = up
                ? this.state.sliderWeight.up
                : this.state.sliderWeight.down;
            localStorage.setItem(
                'voteWeight' +
                    (up ? '' : 'Down') +
                    '-' +
                    username +
                    (is_comment ? '-comment' : ''),
                weight
            );
        };
        this.readSliderWeight = () => {
            const { username, enable_slider, is_comment } = this.props;
            if (enable_slider) {
                const sliderWeightUp = Number(
                    localStorage.getItem(
                        'voteWeight' +
                            '-' +
                            username +
                            (is_comment ? '-comment' : '')
                    )
                );
                const sliderWeightDown = Number(
                    localStorage.getItem(
                        'voteWeight' +
                            'Down' +
                            '-' +
                            username +
                            (is_comment ? '-comment' : '')
                    )
                );
                this.setState({
                    sliderWeight: {
                        up: sliderWeightUp ? sliderWeightUp : MAX_WEIGHT,
                        down: sliderWeightDown ? sliderWeightDown : MAX_WEIGHT,
                    },
                });
            }
        };

        this.toggleWeightUp = e => {
            e.preventDefault();
            this.toggleWeightUpOrDown(true);
        };

        this.toggleWeightDown = e => {
            e && e.preventDefault();
            this.toggleWeightUpOrDown(false);
        };

        this.toggleWeightUpOrDown = up => {
            this.setState({ showWeight: !this.state.showWeight });
        };
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Voting');
    }

    componentWillMount() {
        const { username, active_votes } = this.props;
        this._checkMyVote(username, active_votes);
    }

    componentWillReceiveProps(nextProps) {
        const { username, active_votes } = nextProps;
        this._checkMyVote(username, active_votes);
    }

    _checkMyVote(username, active_votes) {
        if (username && active_votes) {
            const vote = active_votes.find(el => el.get('voter') === username);
            // weight warning, the API may send a string or a number (when zero)
            if (vote)
                this.setState({
                    myVote: parseInt(vote.get('percent') || 0, 10),
                });
        }
    }

    render() {
        const {
            active_votes,
            showList,
            voting,
            flag,
            enable_slider,
            is_comment,
            post_obj,
            price_per_steem,
            sbd_print_rate,
            username,
        } = this.props;

        const { votingUp, votingDown, showWeight, myVote } = this.state;
        if (flag && !username) return null;

        const votingUpActive = voting && votingUp;
        const votingDownActive = voting && votingDown;

        const slider = up => {
            const b = up
                ? this.state.sliderWeight.up
                : this.state.sliderWeight.down;
            const s = up ? '' : '-';
            return (
                <span>
                    <div className="weight-display">{s + b / 100}%</div>
                    <Slider
                        min={100}
                        max={MAX_WEIGHT}
                        step={100}
                        value={b}
                        onChange={this.handleWeightChange(up)}
                        onChangeComplete={this.storeSliderWeight(up)}
                        tooltip={false}
                    />
                </span>
            );
        };

        if (flag) {
            const down = (
                <Icon
                    name={
                        votingDownActive
                            ? 'empty'
                            : myVote < 0 ? 'flag2' : 'flag1'
                    }
                    className="flag"
                />
            );
            const classDown =
                'Voting__button Voting__button-down' +
                (myVote < 0 ? ' Voting__button--downvoted' : '') +
                (votingDownActive ? ' votingDown' : '');
            const flagWeight = post_obj.getIn(['stats', 'flagWeight']);
            // myVote === current vote

            const invokeFlag = (
                <span
                    href="#"
                    onClick={this.toggleWeightDown}
                    title="Flag"
                    id="downvote_button"
                    className="flag"
                >
                    {down}
                </span>
            );

            const revokeFlag = (
                <a
                    href="#"
                    onClick={this.voteDown}
                    title="Flag"
                    className="flag"
                    id="revoke_downvote_button"
                >
                    {down}
                </a>
            );

            const dropdown = (
                <Dropdown
                    show={showWeight}
                    onHide={() => this.setState({ showWeight: false })}
                    onShow={() => {
                        this.setState({ showWeight: true });
                        this.readSliderWeight();
                    }}
                    title={invokeFlag}
                    position={'left'}
                >
                    <div className="Voting__adjust_weight_down">
                        {(myVote == null || myVote === 0) &&
                            enable_slider && (
                                <div className="weight-container">
                                    {slider(false)}
                                </div>
                            )}
                        <CloseButton
                            onClick={() => this.setState({ showWeight: false })}
                        />
                        <div className="clear Voting__about-flag">
                            {ABOUT_FLAG}
                            <span
                                href="#"
                                onClick={this.voteDown}
                                className="button outline"
                                title="Flag"
                            >
                                Flag
                            </span>
                        </div>
                    </div>
                </Dropdown>
            );

            const flag =
                myVote === null || myVote === 0 ? dropdown : revokeFlag;
            return (
                <span className="Voting">
                    <span className={classDown}>
                        {flagWeight > 0 && (
                            <span className="Voting__button-downvotes">
                                {'•'.repeat(flagWeight)}
                            </span>
                        )}
                        {flag}
                    </span>
                </span>
            );
        }

        const total_votes = post_obj.getIn(['stats', 'total_votes']);

        const cashout_time = post_obj.get('cashout_time');
        const max_payout = parsePayoutAmount(
            post_obj.get('max_accepted_payout')
        );
        const pending_payout = parsePayoutAmount(
            post_obj.get('pending_payout_value')
        );
        const percent_steem_dollars =
            post_obj.get('percent_steem_dollars') / 20000;
        const pending_payout_sbd = pending_payout * percent_steem_dollars;
        const pending_payout_sp =
            (pending_payout - pending_payout_sbd) / price_per_steem;
        const pending_payout_printed_sbd =
            pending_payout_sbd * (sbd_print_rate / SBD_PRINT_RATE_MAX);
        const pending_payout_printed_steem =
            (pending_payout_sbd - pending_payout_printed_sbd) / price_per_steem;

        const promoted = parsePayoutAmount(post_obj.get('promoted'));
        const total_author_payout = parsePayoutAmount(
            post_obj.get('total_payout_value')
        );
        const total_curator_payout = parsePayoutAmount(
            post_obj.get('curator_payout_value')
        );

        let payout =
            pending_payout + total_author_payout + total_curator_payout;
        if (payout < 0.0) payout = 0.0;
        if (payout > max_payout) payout = max_payout;
        const payout_limit_hit = payout >= max_payout;
        // Show pending payout amount for declined payment posts
        if (max_payout === 0) payout = pending_payout;
        const up = (
            <Icon
                name={votingUpActive ? 'empty' : 'chevron-up-circle'}
                className="upvote"
            />
        );
        const classUp =
            'Voting__button Voting__button-up' +
            (myVote > 0 ? ' Voting__button--upvoted' : '') +
            (votingUpActive ? ' votingUp' : '');

        // There is an "active cashout" if: (a) there is a pending payout, OR (b) there is a valid cashout_time AND it's NOT a comment with 0 votes.
        const cashout_active =
            pending_payout > 0 ||
            (cashout_time.indexOf('1969') !== 0 &&
                !(is_comment && total_votes == 0));
        const payoutItems = [];

        if (cashout_active) {
            payoutItems.push({
                value: tt('voting_jsx.pending_payout', {
                    value: formatDecimal(pending_payout).join(''),
                }),
            });
            if (max_payout > 0) {
                payoutItems.push({
                    value:
                        '(' +
                        formatDecimal(pending_payout_printed_sbd).join('') +
                        ' ' +
                        DEBT_TOKEN_SHORT +
                        ', ' +
                        (sbd_print_rate != SBD_PRINT_RATE_MAX
                            ? formatDecimal(pending_payout_printed_steem).join(
                                  ''
                              ) +
                              ' ' +
                              LIQUID_TOKEN_UPPERCASE +
                              ', '
                            : '') +
                        formatDecimal(pending_payout_sp).join('') +
                        ' ' +
                        INVEST_TOKEN_SHORT +
                        ')',
                });
            }
            payoutItems.push({ value: <TimeAgoWrapper date={cashout_time} /> });
        }

        if (max_payout == 0) {
            payoutItems.push({ value: tt('voting_jsx.payout_declined') });
        } else if (max_payout < 1000000) {
            payoutItems.push({
                value: tt('voting_jsx.max_accepted_payout', {
                    value: formatDecimal(max_payout).join(''),
                }),
            });
        }
        if (promoted > 0) {
            payoutItems.push({
                value: tt('voting_jsx.promotion_cost', {
                    value: formatDecimal(promoted).join(''),
                }),
            });
        }
        if (total_author_payout > 0) {
            payoutItems.push({
                value: tt('voting_jsx.past_payouts', {
                    value: formatDecimal(
                        total_author_payout + total_curator_payout
                    ).join(''),
                }),
            });
            payoutItems.push({
                value: tt('voting_jsx.past_payouts_author', {
                    value: formatDecimal(total_author_payout).join(''),
                }),
            });
            payoutItems.push({
                value: tt('voting_jsx.past_payouts_curators', {
                    value: formatDecimal(total_curator_payout).join(''),
                }),
            });
        }
        const payoutEl = (
            <DropdownMenu el="div" items={payoutItems}>
                <span style={payout_limit_hit ? { opacity: '0.5' } : {}}>
                    <FormattedAsset
                        amount={payout}
                        asset="$"
                        classname={max_payout === 0 ? 'strikethrough' : ''}
                    />
                    {payoutItems.length > 0 && <Icon name="dropdown-arrow" />}
                </span>
            </DropdownMenu>
        );

        let voters_list = null;
        if (showList && total_votes > 0 && active_votes) {
            const avotes = active_votes.toJS();
            avotes.sort(
                (a, b) =>
                    Math.abs(parseInt(a.rshares)) >
                    Math.abs(parseInt(b.rshares))
                        ? -1
                        : 1
            );
            let voters = [];
            for (
                let v = 0;
                v < avotes.length && voters.length < MAX_VOTES_DISPLAY;
                ++v
            ) {
                const { percent, voter } = avotes[v];
                const sign = Math.sign(percent);
                if (sign === 0) continue;
                voters.push({
                    value: (sign > 0 ? '+ ' : '- ') + voter,
                    link: '/@' + voter,
                });
            }
            if (total_votes > voters.length) {
                voters.push({
                    value: (
                        <span>
                            &hellip;{' '}
                            {tt('voting_jsx.and_more', {
                                count: total_votes - voters.length,
                            })}
                        </span>
                    ),
                });
            }
            voters_list = (
                <DropdownMenu
                    selected={tt('voting_jsx.votes_plural', {
                        count: total_votes,
                    })}
                    className="Voting__voters_list"
                    items={voters}
                    el="div"
                />
            );
        }

        let voteUpClick = this.voteUp;
        let dropdown = null;
        let voteChevron = votingUpActive ? (
            up
        ) : (
            <a
                href="#"
                onClick={voteUpClick}
                title={myVote > 0 ? tt('g.remove_vote') : tt('g.upvote')}
                id="upvote_button"
            >
                {up}
            </a>
        );
        if (myVote <= 0 && enable_slider) {
            voteUpClick = this.toggleWeightUp;
            voteChevron = null;
            // Vote weight adjust
            dropdown = (
                <Dropdown
                    show={showWeight}
                    onHide={() => this.setState({ showWeight: false })}
                    onShow={() => {
                        this.setState({ showWeight: true });
                        this.readSliderWeight();
                    }}
                    title={up}
                >
                    <div className="Voting__adjust_weight">
                        {votingUpActive ? (
                            <a
                                href="#"
                                onClick={() => null}
                                className="confirm_weight"
                                title={tt('g.upvote')}
                            >
                                <Icon size="2x" name={'empty'} />
                            </a>
                        ) : (
                            <a
                                href="#"
                                onClick={this.voteUp}
                                className="confirm_weight"
                                title={tt('g.upvote')}
                            >
                                <Icon size="2x" name="chevron-up-circle" />
                            </a>
                        )}
                        {slider(true)}
                        <CloseButton
                            className="Voting__adjust_weight_close"
                            onClick={() => this.setState({ showWeight: false })}
                        />
                    </div>
                </Dropdown>
            );
        }
        return (
            <span className="Voting">
                <span className="Voting__inner">
                    <span className={classUp}>
                        {voteChevron}
                        {dropdown}
                    </span>
                    {payoutEl}
                </span>
                {voters_list}
            </span>
        );
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const post = state.global.getIn(['content', ownProps.post]);
        if (!post) return ownProps;
        const author = post.get('author');
        const permlink = post.get('permlink');
        const active_votes = post.get('active_votes');
        const is_comment = post.get('parent_author') !== '';

        const current_account = state.user.get('current');
        const username = current_account
            ? current_account.get('username')
            : null;
        const vesting_shares = current_account
            ? current_account.get('vesting_shares')
            : 0.0;
        const delegated_vesting_shares = current_account
            ? current_account.get('delegated_vesting_shares')
            : 0.0;
        const received_vesting_shares = current_account
            ? current_account.get('received_vesting_shares')
            : 0.0;
        const net_vesting_shares =
            vesting_shares - delegated_vesting_shares + received_vesting_shares;
        const voting = state.global.get(
            `transaction_vote_active_${author}_${permlink}`
        );
        let price_per_steem = undefined;
        const feed_price = state.global.get('feed_price');
        if (feed_price && feed_price.has('base') && feed_price.has('quote')) {
            const { base, quote } = feed_price.toJS();
            if (/ SBD$/.test(base) && / STEEM$/.test(quote))
                price_per_steem = parseFloat(base.split(' ')[0]);
        }

        const sbd_print_rate = state.global.getIn(['props', 'sbd_print_rate']);
        const enable_slider =
            net_vesting_shares > VOTE_WEIGHT_DROPDOWN_THRESHOLD;

        return {
            post: ownProps.post,
            flag: ownProps.flag,
            showList: ownProps.showList,
            author,
            permlink,
            username,
            active_votes,
            enable_slider,
            is_comment,
            post_obj: post,
            loggedin: username != null,
            voting,
            price_per_steem,
            sbd_print_rate,
        };
    },

    // mapDispatchToProps
    dispatch => ({
        vote: (weight, { author, permlink, username, myVote, isFlag }) => {
            const confirm = () => {
                if (myVote == null) return null;
                if (weight === 0)
                    return isFlag
                        ? tt('voting_jsx.removing_your_vote')
                        : tt(
                              'voting_jsx.removing_your_vote_will_reset_curation_rewards_for_this_post'
                          );
                if (weight > 0)
                    return isFlag
                        ? tt('voting_jsx.changing_to_an_upvote')
                        : tt(
                              'voting_jsx.changing_to_an_upvote_will_reset_curation_rewards_for_this_post'
                          );
                if (weight < 0)
                    return isFlag
                        ? tt('voting_jsx.changing_to_a_downvote')
                        : tt(
                              'voting_jsx.changing_to_a_downvote_will_reset_curation_rewards_for_this_post'
                          );
                return null;
            };
            dispatch(
                transactionActions.broadcastOperation({
                    type: 'vote',
                    operation: {
                        voter: username,
                        author,
                        permlink,
                        weight,
                        __config: {
                            title:
                                weight < 0
                                    ? tt('voting_jsx.confirm_flag')
                                    : null,
                        },
                    },
                    confirm,
                    errorCallback: errorKey => {
                        console.log('Transaction Error:' + errorKey);
                    },
                })
            );
        },
    })
)(Voting);
