import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import { Link } from 'react-router';
import Icon from 'app/components/elements/Icon';
import transaction from 'app/redux/Transaction'
import ByteBuffer from 'bytebuffer'
import {Set} from 'immutable'

const Long = ByteBuffer.Long
const {string, func, object} = PropTypes

class Witnesses extends React.Component {
    static propTypes = {
        // HTML properties

        // Redux connect properties
        global: object.isRequired,
        accountWitnessVote: func.isRequired,
        username: string,
        witness_votes: object,
    }
    constructor() {
        super()
        this.state = {customUsername: ""}
        this.accountWitnessVote = (accountName, approve, e) => {
            e.preventDefault();
            const {username, accountWitnessVote} = this.props
            this.setState({customUsername: ''});
            accountWitnessVote(username, accountName, approve)
        }
        this.onWitnessChange = e => {
            const customUsername = e.target.value;
            this.setState({customUsername});
        }
    }

   render() {
       const {props: {global, witness_votes}, state: {customUsername}, accountWitnessVote, onWitnessChange} = this
       const sorted_witnesses = global.getIn(['witnesses'])
            .sort((a, b) => Long.fromString(b.get('votes')).subtract(Long.fromString(a.get('votes')).toString()));

        const up = <Icon name="chevron-up-circle" />;
        let witness_votes_count = 30
        let rank = 1
        const witnesses = sorted_witnesses.map(item => {
            const owner = item.get('owner')
            const thread = item.get('url')
            const myVote = witness_votes ? witness_votes.has(owner) : null
            const classUp = 'Voting__button Voting__button-up' +
                (myVote === true ? ' Voting__button--upvoted' : '');
            let witness_thread = ""
            if(thread) {
                witness_thread = <Link to={thread}>witness thread</Link>
            }
            return (
                    <tr key={owner}>
                        <td width="75">
                            {(rank < 10) && '0'}{rank++}
                            &nbsp;&nbsp;
                            <span className={classUp}>
                                <a href="#" onClick={accountWitnessVote.bind(this, owner, !myVote)} title="Vote">{up}</a>
                            </span>
                        </td>
                        <td>
                            <Link to={'/@'+owner}>{owner}</Link>
                        </td>
                        <td>
                            {witness_thread}
                        </td>
                    </tr>
            )
        });

        let addl_witnesses = false;
        if(witness_votes) {
            witness_votes_count -= witness_votes.size
            addl_witnesses = witness_votes.filter(function(item) {
                return !sorted_witnesses.has(item)
            }).map(item => {
                return (
                       <div className="row" key={item}>
                           <div className="column small-12">
                              <span>{/*className="Voting"*/}
                                  <span className="Voting__button Voting__button-up space-right Voting__button--upvoted">
                                      <a href="#" onClick={accountWitnessVote.bind(this, item, false)}
                                          title="Vote">{up}</a>
                                      &nbsp;
                                  </span>
                              </span>
                             <Link to={'/@'+item}>{item}</Link>
                           </div>
                       </div>
                )
            }).toArray();
        }


        return (
            <div>
                <div className="row">
                    <div className="column">
                        <h2>Top Witnesses</h2>
                        <p>
                            <strong>You have {witness_votes_count} votes remaining.</strong>
                            You can vote for a maximum of 30 witnesses.
                        </p>
                    </div>
                </div>
                <div className="row small-collapse">
                    <div className="column small-12">
                        <table>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Witness</th>
                                    <th>Information</th>
                                </tr>
                            </thead>
                            <tbody>
                                {witnesses.toArray()}
                            </tbody>
                        </table>
                        <hr/>
                        <p>If you would like to vote for a witness outside of the top 50, enter the account name below to cast a vote.</p>
                        <form>
                            <input type="text" style={{float: "left", width: "75%"}} value={customUsername} onChange={onWitnessChange} />
                            <button className="darkbtn" onClick={accountWitnessVote.bind(this, customUsername, !(witness_votes ? witness_votes.has(customUsername) : null))}>Vote</button>
                        </form>
                        <br/>
                        {addl_witnesses}
                        <br/><br/>
                     </div>
                </div>
            </div>
        );
    }
}


module.exports = {
    path: '/~witnesses(/:witness)',
    component: connect(
        (state) => {
            const current_user = state.user.get('current');
            const username = current_user && current_user.get('username')
            const current_account = current_user && state.global.getIn(['accounts', username])
            const witness_votes = current_account && Set(current_account.get('witness_votes'))
            return {
                global: state.global,
                username,
                witness_votes,
            };
        },
        (dispatch) => {
            return {
                // requestData: (args) => dispatch({type: 'REQUEST_DATA', payload: args}),
                accountWitnessVote: (username, witness, approve) => {
                    dispatch(transaction.actions.broadcastOperation({
                        type: 'account_witness_vote',
                        operation: {account: username, witness, approve},
                    }))
                },
            }
        }
    )(Witnesses)
};
