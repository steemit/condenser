/* eslint-disable space-before-function-paren */
/* eslint-disable no-continue */
/* eslint-disable no-plusplus */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-underscore-dangle */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-constant-condition */
/* eslint-disable no-mixed-operators */
/* eslint-disable no-unused-expressions */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-undef */
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
import { pricePerSteem } from 'app/utils/StateFunctions';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import {
    formatDecimal,
    parsePayoutAmount,
} from 'app/utils/ParsersAndFormatters';
import DropdownMenu from 'app/components/elements/DropdownMenu';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import Dropdown from 'app/components/elements/Dropdown';
import { userActionRecord } from 'app/utils/ServerApiClient';

const ABOUT_FLAG = (
    <div>
        <p>
            Downvoting a post can decrease pending rewards and make it less
            visible. Common reasons:
        </p>
        <ul>
            <li>Disagreement on rewards</li>
            <li>Fraud or plagiarism</li>
            <li>Hate speech or trolling</li>
            <li>Miscategorized content or spam</li>
        </ul>
    </div>
);

const MAX_VOTES_DISPLAY = 20;
const VOTE_WEIGHT_DROPDOWN_THRESHOLD = 1.0 * 1000.0 * 1000.0;
const SBD_PRINT_RATE_MAX = 10000;
const MAX_WEIGHT = 10000;
const MIN_PAYOUT = 0.02;

function amt(string_amount) {
    return parsePayoutAmount(string_amount);
}

function fmt(decimal_amount, asset = null) {
    return formatDecimal(decimal_amount).join('') + (asset ? ' ' + asset : '');
}

function abs(value) {
    return Math.abs(parseInt(value));
}

class Voting extends React.Component {
    static propTypes = {
        // HTML properties
        showList: PropTypes.bool,

        // Redux connect properties
        vote: PropTypes.func.isRequired,
        author: PropTypes.string, // post was deleted
        permlink: PropTypes.string,
        username: PropTypes.string,
        is_comment: PropTypes.bool,
        active_votes: PropTypes.object,
        post: PropTypes.object,
        enable_slider: PropTypes.bool,
        voting: PropTypes.bool,
        price_per_steem: PropTypes.number,
        sbd_print_rate: PropTypes.number,
    };

    static defaultProps = {
        showList: true,
    };

    constructor(props) {
        super(props);
        this.state = {
            showWeight: false,
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
            const {
                myVote,
                author,
                permlink,
                username,
                is_comment,
            } = this.props;

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

            const rshares = Math.floor(
                0.05 * this.props.net_vests * 1e6 * (weight / 10000.0)
            );
            const isFlag = up ? null : true;
            this.props.vote(weight, {
                author,
                permlink,
                username,
                myVote,
                isFlag,
                rshares,
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
            this.setState({
                showWeight: !this.state.showWeight,
                showWeightDir: up ? 'up' : 'down',
            });
        };
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Voting');
    }

    render() {
        const {
            myVote,
            active_votes,
            showList,
            voting,
            enable_slider,
            is_comment,
            post,
            price_per_steem,
            sbd_print_rate,
            username,
            vests_per_steem,
        } = this.props;

        // `lite` Voting component: e.g. search results
        if (!post.get('pending_payout_value')) {
            return (
                <span className="Voting">
                    <span className="Voting__inner">
                        <FormattedAsset
                            amount={post.get('payout')}
                            asset="$"
                            classname=""
                        />
                    </span>
                </span>
            );
        }

        const { votingUp, votingDown, showWeight, showWeightDir } = this.state;

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

        let downVote;
        if (true) {
            const down = (
                <Icon
                    name={votingDownActive ? 'empty' : 'chevron-down-circle'}
                    className="flag"
                />
            );
            const classDown =
                'Voting__button Voting__button-down' +
                (myVote < 0 ? ' Voting__button--downvoted' : '') +
                (votingDownActive ? ' votingDown' : '');
            // myVote === current vote

            const invokeFlag = (
                <a
                    href="#"
                    onClick={
                        enable_slider ? this.toggleWeightDown : this.voteDown
                    }
                    title="Downvote"
                    id="downvote_button"
                    className="flag"
                >
                    {down}
                </a>
            );

            const revokeFlag = (
                <a
                    href="#"
                    onClick={this.voteDown}
                    title="Downvote"
                    className="flag"
                    id="revoke_downvote_button"
                >
                    {down}
                </a>
            );

            let dropdown = invokeFlag;
            if (enable_slider) {
                dropdown = (
                    <Dropdown
                        show={showWeight && showWeightDir == 'down'}
                        onHide={() => this.setState({ showWeight: false })}
                        onShow={() => {
                            this.setState({ showWeight: true });
                            this.readSliderWeight();
                        }}
                        title={invokeFlag}
                        position={'right'}
                    >
                        <div className="Voting__adjust_weight_down">
                            {(myVote == null || myVote === 0) &&
                                enable_slider && (
                                    <div className="weight-container">
                                        {slider(false)}
                                    </div>
                                )}
                            <CloseButton
                                onClick={() =>
                                    this.setState({ showWeight: false })
                                }
                            />
                            <div className="clear Voting__about-flag">
                                {ABOUT_FLAG}
                                <br />
                                <span
                                    href="#"
                                    onClick={this.voteDown}
                                    className="button outline"
                                    title="Downvote"
                                >
                                    Submit
                                </span>
                            </div>
                        </div>
                    </Dropdown>
                );
            }
            downVote = (
                <span className={classDown}>
                    {myVote === null || myVote === 0 ? dropdown : revokeFlag}
                </span>
            );
        }

        // payout meta
        const total_votes = post.getIn(['stats', 'total_votes']);
        const payout_at = post.get('payout_at');
        const promoted = amt(post.get('promoted'));
        const max_payout = amt(post.get('max_accepted_payout'));
        const percent_sbd = post.get('percent_steem_dollars') / 20000;

        // pending payout, and completed author/curator payout
        const pending_payout = amt(post.get('pending_payout_value'));
        const author_payout = amt(post.get('author_payout_value'));
        const curator_payout = amt(post.get('curator_payout_value'));
        const total_payout = pending_payout + author_payout + curator_payout;

        // estimated pending payout breakdowns
        const _sbd = pending_payout * percent_sbd;
        const pending_sp = (pending_payout - _sbd) / price_per_steem;
        const pending_sbd = _sbd * (sbd_print_rate / SBD_PRINT_RATE_MAX);
        const pending_steem = (_sbd - pending_sbd) / price_per_steem;

        const payout_limit_hit = total_payout >= max_payout;
        const shown_payout =
            payout_limit_hit && max_payout > 0 ? max_payout : total_payout;

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

        const payoutItems = [];

        // pending payout info
        if (!post.get('is_paidout') && pending_payout > 0) {
            payoutItems.push({
                value: tt('voting_jsx.pending_payout', {
                    value: fmt(pending_payout),
                }),
            });

            // pending breakdown
            if (max_payout > 0) {
                payoutItems.push({
                    value: `${tt(
                        'voting_jsx.breakdown'
                    )}: <br>&nbsp;&nbsp;&nbsp;&nbsp;${fmt(
                        pending_sbd,
                        DEBT_TOKEN_SHORT
                    )}, ${
                        sbd_print_rate != SBD_PRINT_RATE_MAX
                            ? `<br>&nbsp;&nbsp;&nbsp;&nbsp;${fmt(
                                  pending_steem,
                                  LIQUID_TOKEN_UPPERCASE
                              )}, `
                            : ''
                    }<br>&nbsp;&nbsp;&nbsp;&nbsp;${fmt(
                        pending_sp,
                        INVEST_TOKEN_SHORT
                    )}`,
                    raw: true,
                });
            }

            const beneficiaries = post.get('beneficiaries');
            if (beneficiaries) {
                beneficiaries.forEach(function(key) {
                    payoutItems.push({
                        value:
                            key.get('account') +
                            ': ' +
                            (fmt(parseFloat(key.get('weight')) / 100) + '%'),
                        link: '/@' + key.get('account'),
                    });
                });
            }

            const payoutDate = (
                <span>
                    {tt('voting_jsx.payout')}{' '}
                    <TimeAgoWrapper date={payout_at} />
                </span>
            );
            payoutItems.push({ value: payoutDate });

            if (pending_payout > 0 && pending_payout < MIN_PAYOUT) {
                payoutItems.push({
                    value: tt('voting_jsx.must_reached_minimum_payout'),
                });
            }
        }

        // max payout / payout declined
        if (max_payout == 0) {
            payoutItems.push({ value: tt('voting_jsx.payout_declined') });
        } else if (max_payout < 1000000) {
            payoutItems.push({
                value: tt('voting_jsx.max_accepted_payout', {
                    value: fmt(max_payout),
                }),
            });
        }

        // promoted balance
        if (promoted > 0) {
            payoutItems.push({
                value: tt('voting_jsx.promotion_cost', {
                    value: fmt(promoted),
                }),
            });
        }

        // past payout stats
        if (post.get('is_paidout') && total_payout > 0) {
            // estimated author has been payout breakdowns
            const _author_sbd_temp = author_payout * percent_sbd;
            const _author_payout_sp =
                (author_payout - _author_sbd_temp) / price_per_steem;
            const _curator_sbd_temp = curator_payout * percent_sbd;
            const _curator_payout_sp =
                (curator_payout - _curator_sbd_temp) / price_per_steem;

            payoutItems.push({
                value: tt('voting_jsx.past_payouts', {
                    value: fmt(total_payout),
                }),
            });
            payoutItems.push({
                value: tt('voting_jsx.past_payouts_author', {
                    value: fmt(author_payout),
                }),
            });
            payoutItems.push({
                value: tt('voting_jsx.past_payouts_curators', {
                    value: fmt(curator_payout),
                }),
            });
        }

        const payoutEl = (
            <DropdownMenu el="div" items={payoutItems} className="Voting__pane">
                <span style={payout_limit_hit ? { opacity: '0.5' } : {}}>
                    <FormattedAsset
                        amount={shown_payout}
                        asset="$"
                        classname={max_payout === 0 ? 'strikethrough' : ''}
                    />
                    {payoutItems.length > 0 && <Icon name="dropdown-arrow" />}
                </span>
            </DropdownMenu>
        );

        let voters_list = null;
        if (showList && total_votes > 0 && active_votes) {
            const voters = [];

            // add top votes
            const avotes = active_votes.toJS();
            const maxlen = Math.min(avotes.length, MAX_VOTES_DISPLAY);
            avotes.sort((a, b) => (abs(a.rshares) > abs(b.rshares) ? -1 : 1));
            for (let v = 0; v < maxlen; ++v) {
                const { rshares, voter } = avotes[v];
                if (rshares == '0') continue;
                const sign = rshares[0] == '-' ? '- ' : '+ ';
                voters.push({ value: sign + voter, link: '/@' + voter });
            }

            // add overflow, if any
            const extra = total_votes - voters.length;
            if (extra > 0) {
                voters.push({
                    value: tt('voting_jsx.and_more', { count: extra }),
                });
            }

            // build voters list
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
                    show={showWeight && showWeightDir == 'up'}
                    onHide={() => this.setState({ showWeight: false })}
                    onShow={() => {
                        this.setState({
                            showWeight: true,
                            showWeightDir: 'up',
                        });
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
                    {downVote}
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
        const post =
            ownProps.post || state.global.getIn(['content', ownProps.post_ref]);

        if (!post) {
            console.error('post_not_found', ownProps);
            throw 'post not found';
        }

        const author = post.get('author');
        const permlink = post.get('permlink');
        const active_votes = post.get('active_votes');
        const is_comment = post.get('depth') == 0;

        const current = state.user.get('current');
        const username = current ? current.get('username') : null;
        const net_vests = current ? current.get('effective_vests') : 0.0;
        const vote_status_key = `transaction_vote_active_${author}_${permlink}`;
        const voting = state.global.get(vote_status_key);
        const price_per_steem =
            pricePerSteem(state) || ownProps.price_per_steem;
        const sbd_print_rate = state.global.getIn(
            ['props', 'sbd_print_rate'],
            ownProps.sbd_print_rate
        );
        const enable_slider = net_vests > VOTE_WEIGHT_DROPDOWN_THRESHOLD;

        let myVote = ownProps.myVote || null; // ownProps: test only
        if (username && active_votes) {
            const vote = active_votes.find(el => el.get('voter') === username);
            if (vote) myVote = parseInt(vote.get('rshares'), 10);
        }

        return {
            post,
            showList: ownProps.showList,
            net_vests,
            author,
            permlink,
            username,
            myVote,
            active_votes,
            enable_slider,
            is_comment,
            voting,
            price_per_steem,
            sbd_print_rate,
            vests_per_steem:
                ownProps.vests_per_steem ||
                (state.global.has('vests_per_steem')
                    ? state.global.get('vests_per_steem')
                    : 0),
        };
    },

    // mapDispatchToProps
    dispatch => ({
        vote: (
            weight,
            { author, permlink, username, myVote, isFlag, rshares }
        ) => {
            const confirm = () => {
                // new vote
                if (myVote == null) return null;

                // changing a vote
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
            userActionRecord('vote', {
                vote_type: weight === 0 ? 'cancel' : weight > 0 ? 'up' : 'down',
                voter: username,
                author,
                permlink,
                weight,
            });
            dispatch(
                transactionActions.broadcastOperation({
                    type: 'vote',
                    operation: {
                        voter: username,
                        author,
                        permlink,
                        weight,
                        __rshares: rshares,
                        __config: {
                            title: weight < 0 ? 'Confirm Downvote' : null,
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
