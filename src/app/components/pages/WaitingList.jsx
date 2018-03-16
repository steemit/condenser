import React from 'react';
import AddToWaitingList from 'app/components/modules/AddToWaitingList';
import tt from 'counterpart';

class WaitingList extends React.Component {
    render() {
        return (
            <div className="row">
                <div className="column large-4 medium-6 small-12">
                    <p>
                        {tt(
                            'g.sorry_your_reddit_account_doesnt_have_enough_karma'
                        )}
                    </p>
                    <AddToWaitingList />
                    <br />
                    <hr />
                    <p>
                        {tt(
                            'g.or_click_the_button_below_to_register_with_facebook'
                        )}
                    </p>
                    <a
                        href="/connect/facebook"
                        className="button SignUp--fb-button"
                    >
                        {tt('g.register_with_facebook')}
                    </a>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'waiting_list.html',
    component: WaitingList,
};
