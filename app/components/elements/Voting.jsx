import React from 'react';
import { connect } from 'react-redux';
import transaction from 'app/redux/Transaction';
import Slider from 'react-rangeslider';
import Icon from 'app/components/elements/Icon';
import FormattedAsset from 'app/components/elements/FormattedAsset';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import pluralize from 'pluralize';
import {formatDecimal, parsePayoutAmount} from 'app/utils/ParsersAndFormatters';
import DropdownMenu from 'app/components/elements/DropdownMenu';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import FoundationDropdown from 'app/components/elements/FoundationDropdown';
import CloseButton from 'react-foundation-components/lib/global/close-button';

const ABOUT_FLAG = <div>
    <p>Downvoting a post can remove rewards and make this material less visible.  Some common reasons:</p>
    <ul>
        <li>Disagreement on rewards</li>
        <li>Fraud or plagiarism</li>
        <li>Hate speech or trolling</li>
        <li>Intentionally miscategorized content or spam</li>
    </ul>
</div>;

const MAX_VOTES_DISPLAY = 20;
const VOTE_WEIGHT_DROPDOWN_THRESHOLD = 1.0 * 1000.0 * 1000.0;

class Voting extends React.Component {

    static propTypes = {
        // HTML properties
        post: React.PropTypes.string.isRequired,
        flag: React.PropTypes.bool,
        showList: React.PropTypes.bool,

        // Redux connect properties
        vote: React.PropTypes.func.isRequired,
        author: React.PropTypes.string, // post was deleted
        permlink: React.PropTypes.string,
        username: React.PropTypes.string,
        is_comment: React.PropTypes.bool,
        active_votes: React.PropTypes.object,
        loggedin: React.PropTypes.bool,
        post_obj: React.PropTypes.object,
        vesting_shares: React.PropTypes.number,
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
            myVote: null,
            weight: 10000
        };

        this.voteUp = e => {
            e.preventDefault();
            this.voteUpOrDown(true)
        };
        this.voteDown = e => {
            e.preventDefault();
            this.voteUpOrDown(false)
        };
        this.voteUpOrDown = (up) => {
            if(this.props.voting) return;
            this.setState({votingUp: up, votingDown: !up});
            const {myVote} = this.state;
            const {author, permlink, username, is_comment} = this.props;
            if (this.props.vesting_shares > VOTE_WEIGHT_DROPDOWN_THRESHOLD) {
                localStorage.setItem('voteWeight' + (up ? '' : 'Down') + '-'+username+(is_comment ? '-comment' : ''),
                    this.state.weight);
            }
            // already voted Up, remove the vote
            const weight = up ? (myVote > 0 ? 0 : this.state.weight) : (myVote < 0 ? 0 : -1 * this.state.weight);
            if (this.state.showWeight) this.setState({showWeight: false});
            this.props.vote(weight, {author, permlink, username, myVote})
        };

        this.handleWeightChange = weight => {
            this.setState({weight})
        };

        this.toggleWeightUp = e => {
            e.preventDefault();
            this.toggleWeightUpOrDown(true)
        };
        this.toggleWeightDown = e => {
            e.preventDefault();
            this.toggleWeightUpOrDown(false)
        };
        this.toggleWeightUpOrDown = up => {
            const {username, is_comment} = this.props;
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

    componentWillMount() {
        const {username, active_votes} = this.props;
        this._checkMyVote(username, active_votes)
    }

    componentWillReceiveProps(nextProps) {
        const {username, active_votes} = nextProps;
        this._checkMyVote(username, active_votes)
    }

    _checkMyVote(username, active_votes) {
        if (username && active_votes) {
            const vote = active_votes.find(el => el.get('voter') === username);
            // weight warning, the API may send a string or a number (when zero)
            if(vote) this.setState({myVote: parseInt(vote.get('percent') || 0, 10)})
        }
    }

    render() {
        const {active_votes, showList, voting, flag, vesting_shares, is_comment, post_obj} = this.props;
        const {username} = this.props;
        const {votingUp, votingDown, showWeight, weight, myVote} = this.state;
        // console.log('-- Voting.render -->', myVote, votingUp, votingDown);
        if(flag && !username) return null

        const votingUpActive = voting && votingUp;
        const votingDownActive = voting && votingDown;

        if (flag) {
            const down = <Icon name={votingDownActive ? 'empty' : 'chevron-down-circle'} />;
            const classDown = 'Voting__button Voting__button-down' + (myVote < 0 ? ' Voting__button--downvoted' : '') + (votingDownActive ? ' votingDown' : '');
            const flagWeight = post_obj.getIn(['stats', 'flagWeight']);

            // myVote === current vote
            const dropdown = <FoundationDropdown show={showWeight} onHide={() => this.setState({showWeight: false})} className="Voting__adjust_weight_down">
                {(myVote == null || myVote === 0) && vesting_shares > VOTE_WEIGHT_DROPDOWN_THRESHOLD &&
                    <div>
                        <div className="weight-display">- {weight / 100}%</div>
                        <Slider min={100} max={10000} step={100} value={weight} onChange={this.handleWeightChange} />
                    </div>
                }
                <CloseButton onClick={() => this.setState({showWeight: false})} />
                <div className="clear Voting__about-flag">
                    <p>{ABOUT_FLAG}</p>
                    <a href="#" onClick={this.voteDown} className="button outline">Submit</a>
                </div>
            </FoundationDropdown>;

            const flagClickAction = myVote === null || myVote === 0 ? this.toggleWeightDown : this.voteDown
            return <span className="Voting">
                <span className={classDown}>
                    {flagWeight > 0 && <span className="Voting__button-downvotes">{"•".repeat(flagWeight)}</span>}
                    {votingDownActive ? down : <a href="#" onClick={flagClickAction} title="Downvote">{down}</a>}
                    {dropdown}
                </span>
            </span>
        }

        const total_votes = post_obj.getIn(['stats', 'total_votes']);

        const cashout_time = post_obj.get('cashout_time');
        const max_payout = parsePayoutAmount(post_obj.get('max_accepted_payout'));
        const pending_payout = parsePayoutAmount(post_obj.get('pending_payout_value'));
        const promoted = parsePayoutAmount(post_obj.get('promoted'));
        const total_author_payout = parsePayoutAmount(post_obj.get('total_payout_value'));
        const total_curator_payout = parsePayoutAmount(post_obj.get('curator_payout_value'));

        let payout = pending_payout + total_author_payout + total_curator_payout;
        if (payout < 0.0) payout = 0.0;
        if (payout > max_payout) payout = max_payout;
        const payout_limit_hit = payout >= max_payout;
        // Show pending payout amount for declined payment posts
        if (max_payout === 0) payout = pending_payout;
        const up = <Icon name={votingUpActive ? 'empty' : 'chevron-up-circle'} />;
        const classUp = 'Voting__button Voting__button-up' + (myVote > 0 ? ' Voting__button--upvoted' : '') + (votingUpActive ? ' votingUp' : '');

        // There is an "active cashout" if: (a) there is a pending payout, OR (b) there is a valid cashout_time AND it's NOT a comment with 0 votes.
        const cashout_active = pending_payout > 0 || (cashout_time.indexOf('1969') !== 0 && !(is_comment && total_votes == 0));
        const payoutItems = [];

        if(cashout_active) {
            payoutItems.push({value: 'Potential Payout $' + formatDecimal(pending_payout).join('')});
        }
        if(promoted > 0) {
            payoutItems.push({value: 'Promotion Cost $' + formatDecimal(promoted).join('')});
        }
        if(cashout_active) {
            payoutItems.push({value: <TimeAgoWrapper date={cashout_time} />});
        }

        if(max_payout == 0) {
            payoutItems.push({value: 'Payout Declined'})
        } else if (max_payout < 1000000) {
            payoutItems.push({value: 'Max Accepted Payout $' + formatDecimal(max_payout).join('')})
        }
        if(total_author_payout > 0) {
            payoutItems.push({value: 'Past Payouts $' + formatDecimal(total_author_payout + total_curator_payout).join('')});
            payoutItems.push({value: ' - Author: $' + formatDecimal(total_author_payout).join('')});
            payoutItems.push({value: ' - Curators: $' + formatDecimal(total_curator_payout).join('')});
        }
        const payoutEl = <DropdownMenu el="div" items={payoutItems}>
            <span style={payout_limit_hit ? {opacity: '0.5'} : {}}>
                <FormattedAsset amount={payout} asset="$" classname={max_payout === 0 ? 'strikethrough' : ''} />
                {payoutItems.length > 0 && <Icon name="dropdown-arrow" />}
            </span>
        </DropdownMenu>;

        let voters_list = null;
        if (showList && total_votes > 0 && active_votes) {
            const avotes = active_votes.toJS();
            avotes.sort((a, b) => Math.abs(parseInt(a.rshares)) > Math.abs(parseInt(b.rshares)) ? -1 : 1)
            let voters = [];
            for( let v = 0; v < avotes.length && voters.length < MAX_VOTES_DISPLAY; ++v ) {
                const {percent, voter} = avotes[v]
                const sign = Math.sign(percent)
                if(sign === 0) continue
                voters.push({value: (sign > 0 ? '+ ' : '- ') + voter, link: '/@' + voter})
            }
            if (total_votes > voters.length) {
                voters.push({value: <span>&hellip; and {(total_votes - voters.length)} more</span>});
            }
            voters_list = <DropdownMenu selected={pluralize('votes', total_votes, true)} className="Voting__voters_list" items={voters} el="div" />;
        }

        let voteUpClick = this.voteUp;
        let dropdown = null;
        if (myVote <= 0 && vesting_shares > VOTE_WEIGHT_DROPDOWN_THRESHOLD) {
            voteUpClick = this.toggleWeightUp;
            dropdown = <FoundationDropdown show={showWeight} onHide={() => this.setState({showWeight: false})}>
                <div className="Voting__adjust_weight">
                    <a href="#" onClick={this.voteUp} className="confirm_weight" title="Upvote"><Icon size="2x" name="chevron-up-circle" /></a>
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
                        {votingUpActive ? up : <a href="#" onClick={voteUpClick} title={myVote > 0 ? 'Remove Vote' : 'Upvote'}>{up}</a>}
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
        const active_votes = post.get('active_votes')
        const is_comment = post.get('parent_author') !== ''

        const current_account = state.user.get('current')
        const username = current_account ? current_account.get('username') : null;
        const vesting_shares = current_account ? current_account.get('vesting_shares') : 0.0;
        const voting = state.global.get(`transaction_vote_active_${author}_${permlink}`)

        return {
            post: ownProps.post,
            flag: ownProps.flag,
            showList: ownProps.showList,
            author, permlink, username, active_votes, vesting_shares, is_comment,
            post_obj: post,
            loggedin: username != null,
            voting
        }
    },

    // mapDispatchToProps
    (dispatch) => ({
        vote: (weight, {author, permlink, username, myVote}) => {
            const confirm = () => {
                if(myVote == null) return
                const t = ' will reset your curation rewards for this post.'
                if(weight === 0) return 'Removing your vote' + t
                if(weight > 0) return 'Changing to an Up-Vote' + t
                if(weight < 0) return 'Changing to a Down-Vote' + t
                return null
            }
            dispatch(transaction.actions.broadcastOperation({
                type: 'vote',
                operation: {voter: username, author, permlink, weight,
                    __config: {title: weight < 0 ? 'Confirm Downvote' : null},
                },
                confirm,
            }))
        },
    })
)(Voting)
