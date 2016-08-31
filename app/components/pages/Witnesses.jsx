import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import { Link } from 'react-router';
import Icon from 'app/components/elements/Icon';
import transaction from 'app/redux/Transaction'
import ByteBuffer from 'bytebuffer'
import {Set} from 'immutable'
import { translate } from '../../Translator';

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
        this.accountWitnessVote = (accountName, approve, e) => {
            e.preventDefault();
            const {username, accountWitnessVote} = this.props
            accountWitnessVote(username, accountName, approve)
        }
    }

   render() {
       const {props: {global, witness_votes}, accountWitnessVote} = this
       const sorted_witnesses = global.getIn(['witnesses'])
            .sort((a, b) => Long.fromString(b.get('votes')).subtract(Long.fromString(a.get('votes')).toString()));

        const header =
            <div className="row">
                <div className="column small-1">
                    <label>{translate('vote')}</label>
                </div>
                <div className="column small-4">
                    <label>{translate('witness')}</label>
                </div>
            </div>
        const up = <Icon name="chevron-up-circle" />;
        let rank = 1
        const witnesses = sorted_witnesses.map(item => {
            const owner = item.get('owner')
            const myVote = witness_votes ? witness_votes.has(owner) : null
            const classUp = 'Voting__button Voting__button-up space-right' +
                (myVote === true ? ' Voting__button--upvoted' : '');
            return (
                   <div className="row" key={owner}>
                       <div className="column small-12">
                          <span>{/*className="Voting"*/}
                              {(rank < 10) && '0'}{rank++}
                              &nbsp;&nbsp;
                              <span className={classUp}>
                                  <a href="#" onClick={accountWitnessVote.bind(this, owner, !myVote)}
                                      title={translate('vote')}>{up}</a>
                                  &nbsp;
                              </span>
                          </span>
                         <Link to={'/@'+owner}>{owner}</Link>
                       </div>
                   </div>
            )
        });

      return (
      <div>
         <div className="Witnesses row">
             <h2>{translate('top_witnesses')}</h2>
         </div>
        {header}
         <div className="Witnesses row">
            <div className="column small-12">
                 {witnesses.toArray()}
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
