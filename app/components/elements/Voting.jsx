import React from 'react';
import { connect } from 'react-redux';
import transaction from 'app/redux/Transaction';
import Slider from 'react-rangeslider';
import Icon from 'app/components/elements/Icon';
import Follow from 'app/components/elements/Follow';
import FormattedAsset from 'app/components/elements/FormattedAsset';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import pluralize from 'pluralize';
import {formatDecimal, parsePayoutAmount} from 'app/utils/ParsersAndFormatters';
import DropdownMenu from 'app/components/elements/DropdownMenu';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import FoundationDropdown from 'app/components/elements/FoundationDropdown';
import CloseButton from 'react-foundation-components/lib/global/close-button';
import { translate } from 'app/Translator';
import LocalizedCurrency, {localizedCurrency} from 'app/components/elements/LocalizedCurrency';
import {DEBT_TICKER} from 'config/client_config';

const ABOUT_FLAG = <div>
    <p>{translate('flagging_post_can_remove_rewards_the_flag_should_be_used_for_the_following')}:</p>
    <ul>
        <li>{translate('fraud_or_plagiarism')}</li>
        <li>{translate('hate_speech_or_internet_trolling')}</li>
        <li>{translate('intentional_miss_categorized_content_or_spam')}</li>
    </ul>
</div>

const MAX_VOTES_DISPLAY = 20;
const VOTE_WEIGHT_DROPDOWN_THRESHOLD = 1.0 * 1000.0 * 1000.0;

class Voting extends React.Component {

    static propTypes = {
        // HTML properties
        post: React.PropTypes.string.isRequired,
        flag: React.PropTypes.bool,

        // Redux connect properties
        vote: React.PropTypes.func.isRequired,
        author: React.PropTypes.string, // post was deleted
        permlink: React.PropTypes.string,
        username: React.PropTypes.string,
        is_comment: React.PropTypes.bool,
        myVote: React.PropTypes.number,
        active_votes: React.PropTypes.object,
        loggedin: React.PropTypes.bool,
        pending_payout: React.PropTypes.number,
        promoted: React.PropTypes.number,
        total_author_payout: React.PropTypes.number,
        total_curator_payout: React.PropTypes.number,
        cashout_time: React.PropTypes.string,
        vesting_shares: React.PropTypes.number,
        showList: React.PropTypes.bool,
        voting: React.PropTypes.bool,
    };

    static defaultProps = {
        showList: true,
        flag: false
    };

    constructor(props) {
        super(props);
        this.state = {
            showWeight: false,
            weight: 10000
        }

        this.voteUp = e => {
            e.preventDefault();
            this.voteUpOrDown(true)
        }
        this.voteDown = e => {
            e.preventDefault();
            this.voteUpOrDown(false)
        }
        this.voteUpOrDown = (up) => {
            if(this.props.voting) return
            this.setState({votingUp: up, votingDown: !up})
            const {author, permlink, username, myVote, is_comment} = this.props
            if (this.props.vesting_shares > VOTE_WEIGHT_DROPDOWN_THRESHOLD) {
                localStorage.setItem('voteWeight' + (up ? '' : 'Down') + '-'+username+(is_comment ? '-comment' : ''),
                    this.state.weight);
            }
            // already voted Up, remove the vote
            const weight = up ? (myVote > 0 ? 0 : this.state.weight) : (myVote < 0 ? 0 : -1 * this.state.weight)
            if (this.state.showWeight) this.setState({showWeight: false})
            this.props.vote(weight, {author, permlink, username, myVote})
        };

        this.handleWeightChange = weight => {
            this.setState({weight})
        };

        this.toggleWeightUp = e => {
            e.preventDefault();
            this.toggleWeightUpOrDown(true)
        }
        this.toggleWeightDown = e => {
            e.preventDefault();
            this.toggleWeightUpOrDown(false)
        }
        this.toggleWeightUpOrDown = up => {
            const {username, is_comment} = this.props
            // Upon opening dialog, read last used weight (this works accross tabs)
            if(! this.state.showWeight) {
                localStorage.removeItem('vote_weight'); // deprecated. remove this line after 8/31
                const saved_weight = localStorage.getItem('voteWeight' + (up ? '' : 'Down') + '-'+username+(is_comment ? '-comment' : ''));
                this.setState({weight: saved_weight ? parseInt(saved_weight, 10) : 10000});
            }
            this.setState({showWeight: !this.state.showWeight})
        };
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Voting')
    }

    render() {
        const {myVote, active_votes, showList, voting, flag, vesting_shares, is_comment} = this.props;
        const {username} = this.props;
        const {votingUp, votingDown, showWeight, weight} = this.state;
        // console.log('-- Voting.render -->', myVote, votingUp, votingDown);
        if(!active_votes) return <span></span>
        if(flag && !username) return null
        // if( payout[0] == '-' ) payout = "0.000 SBD";
        const votingUpActive = voting && votingUp
        const votingDownActive = voting && votingDown

        const down = <Icon name={votingDownActive ? 'empty' : (myVote < 0 ? 'flag2' : 'flag1')} />;
        const classDown = 'Voting__button Voting__button-down' + (myVote < 0 ? ' Voting__button--downvoted' : '') + (votingDownActive ? ' votingDown' : '');

        if (flag) {
            // myVote === current vote
            const dropdown = <FoundationDropdown show={showWeight} className="Voting__adjust_weight_down">
                {(myVote == null || myVote === 0) && vesting_shares > VOTE_WEIGHT_DROPDOWN_THRESHOLD &&
                    <div>
                        <div className="weight-display">- {weight / 100}%</div>
                        <Slider min={100} max={10000} step={100} value={weight} onChange={this.handleWeightChange} />
                    </div>
                }
                <CloseButton onClick={() => this.setState({showWeight: false})} />
                <div className="clear Voting__about-flag">
                    <p>{ABOUT_FLAG}</p>
                    <a href="#" onClick={this.voteDown} className="button outline" title={translate('flag')}>{translate('flag')}</a>
                </div>
            </FoundationDropdown>

            // ? Remove negative votes unless full power -1000 (we had downvoting spam)
            const down_votes = active_votes.filter( v => v.get('percent') < 0 /*=== -1000*/).size
            const flagClickAction = myVote === null || myVote === 0 ? this.toggleWeightDown : this.voteDown
            return <span className="Voting">
                <span className={classDown}>
                    {down_votes > 0 && <span className="Voting__button-downvotes">{down_votes}</span>}
                    {votingDownActive ? down : <a href="#" onClick={flagClickAction} title={translate('flag')}>{down}</a>}
                    {dropdown}
                </span>
            </span>
        }

        const {max_payout, pending_payout, total_author_payout, total_curator_payout, cashout_time, promoted} = this.props;
        let payout = pending_payout + total_author_payout + total_curator_payout;
        if (payout < 0.0) payout = 0.0;
        if (payout > max_payout) payout = max_payout;
        const payout_limit_hit = payout >= max_payout;

        const up = <Icon name={votingUpActive ? 'empty' : 'chevron-up-circle'} />;
        const classUp = 'Voting__button Voting__button-up' + (myVote > 0 ? ' Voting__button--upvoted' : '') + (votingUpActive ? ' votingUp' : '');

        // There is an "active cashout" if: (a) there is a pending payout, OR (b) there is a valid cashout_time AND it's NOT a comment with 0 votes.
        const cashout_active = pending_payout > 0 || (cashout_time.indexOf('1969') !== 0 && !(is_comment && active_votes.size == 0))
        const payoutItems = [];

        if(cashout_active) {
            payoutItems.push({value: translate('potential_payout') + ' ' + localizedCurrency(pending_payout) + ' (' + pending_payout.toFixed(3) + ' ' + DEBT_TICKER + ')'});
        }
        if(promoted > 0) {
            payoutItems.push({value: translate('boost_payments') + ' ' + localizedCurrency(promoted)});
        }
        if(cashout_active) {
            payoutItems.push({value: <TimeAgoWrapper date={cashout_time} />});
        }

        if(max_payout == 0) {
            payoutItems.push({value: translate('payouts_declined')})
        } else if (max_payout < 1000000) {
            payoutItems.push({value: translate('max_accepted_payout') + localizedCurrency(max_payout)})
        }
        if(total_author_payout > 0) {
            payoutItems.push({value: translate('past_payouts') + ' ' + localizedCurrency(total_author_payout + total_curator_payout)});
            payoutItems.push({value: ' - ' + translate('authors') + ': ' + localizedCurrency(total_author_payout)});
            payoutItems.push({value: ' - ' + translate('curators') + ': ' + localizedCurrency(total_curator_payout)});
        }
        const payoutEl = <DropdownMenu el="div" items={payoutItems}>
            <span style={payout_limit_hit ? {opacity: '0.5'} : {}}>
                {/* <FormattedAsset amount={payout} asset={DEFAULT_CURRENCY} classname={max_payout === 0 ? 'strikethrough' : ''} /> */}
                {/* TODO check FormattedAsset and it's possible replacememnt with LocalizedCurrency */}
                <LocalizedCurrency amount={payout} className={max_payout === 0 ? 'strikethrough' : ''} />
                {payoutItems.length > 0 && <Icon name="dropdown-arrow" />}
            </span>
        </DropdownMenu>;

        const avotes = active_votes.toJS();
        avotes.sort((a, b) => Math.abs(parseInt(a.rshares)) > Math.abs(parseInt(b.rshares)) ? -1 : 1)
        let count = 0;
        let voters = [];
        for( let v = 0; v < avotes.length; ++v ) {
            const pct = avotes[v].percent
            const cnt = Math.sign(pct)
            if(cnt === 0) continue
            count += 1
            if (showList && voters.length < MAX_VOTES_DISPLAY) {
                const voterPercent= pct / 100 + '%';
                voters.push({value: (cnt > 0 ? '+ ' : '- ') + avotes[v].voter, link: '/@' + avotes[v].voter, data: voterPercent});
            }
        }
        if (count > MAX_VOTES_DISPLAY) voters.push({value: <span>&hellip; {' ' + translate('and') + ' '} {(count - MAX_VOTES_DISPLAY)} {' ' + translate('more')}</span>});

        let voters_list = null;
        if (showList && count > 0) {
            voters_list = <DropdownMenu selected={translate('vote_count', {voteCount: count})} className="Voting__voters_list" items={voters} el="div" />;
        }

        let voteUpClick = this.voteUp;
        let dropdown = null;
        if (myVote <= 0 && vesting_shares > VOTE_WEIGHT_DROPDOWN_THRESHOLD) {
            voteUpClick = this.toggleWeightUp;
            dropdown = <FoundationDropdown show={showWeight}>
                <div className="Voting__adjust_weight">
                    <a href="#" onClick={this.voteUp} className="confirm_weight" title={translate('upvote')}><Icon size="2x" name="chevron-up-circle" /></a>
                    <div className="weight-display">{weight / 100}%</div>
                    <Slider min={100} max={10000} step={100} value={weight} onChange={this.handleWeightChange} />
                    <CloseButton className="Voting__adjust_weight_close" onClick={() => this.setState({showWeight: false})} />
                </div>
            </FoundationDropdown>;
        }
        return (
            <span className="Voting">
                <span className="Voting__inner">
                    <span className={classUp}>
                        {votingUpActive ? up : <a href="#" onClick={voteUpClick} title={translate(myVote > 0 ? 'remove_vote' : 'upvote')}>{up}</a>}
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
        const post = state.global.getIn(['content', ownProps.post])
        if (!post) return ownProps
        const author = post.get('author')
        const permlink = post.get('permlink')
        const last_payout = post.get('last_payout')
        const active_votes = post.get('active_votes')
        const is_comment = post.get('parent_author') !== ''
        const current_account = state.user.get('current')
        const cashout_time = post.get('cashout_time')
        const max_payout           = parsePayoutAmount(post.get('max_accepted_payout'))
        const pending_payout       = parsePayoutAmount(post.get('pending_payout_value'))
        const promoted             = parsePayoutAmount(post.get('promoted'))
        const total_author_payout  = parsePayoutAmount(post.get('total_payout_value'))
        const total_curator_payout = parsePayoutAmount(post.get('curator_payout_value'))
        const username = current_account ? current_account.get('username') : null;
        const vesting_shares = current_account ? current_account.get('vesting_shares') : 0.0;
        const voting = state.global.get(`transaction_vote_active_${author}_${permlink}`)
        let myVote = null;
        if (username && active_votes) {
            const vote = active_votes.find(el => el.get('voter') === username)
            // weigth warning, the API may send a string or a number (when zero)
            if(vote) myVote = parseInt(vote.get('percent') || 0, 10)
        }
        return {
            ...ownProps,
            myVote, author, permlink, username, active_votes, vesting_shares, is_comment,
            max_payout, pending_payout, promoted, total_author_payout, total_curator_payout, cashout_time,
            loggedin: username != null,
            voting
        }
    },

    // mapDispatchToProps
    (dispatch) => ({
        vote: (weight, {author, permlink, username, myVote}) => {
            const confirm = () => {
                if(myVote == null) return
                const t = ' ' + translate('we_will_reset_curation_rewards_for_this_post') + '.'
                if(weight === 0) return translate('removing_your_vote') + t
                if(weight > 0) return translate('changing_to_an_upvote') + t
                if(weight < 0) return translate('changing_to_a_downvote') + t
                return null
            }
            dispatch(transaction.actions.broadcastOperation({
                type: 'vote',
                operation: {voter: username, author, permlink, weight,
                    __config: {title: weight < 0 ? translate('confirm_flag') : null},
                },
                confirm,
            }))
        },
    })
)(Voting)
