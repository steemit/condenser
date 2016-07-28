import React from 'react';
import AddToWaitingList from 'app/components/modules/AddToWaitingList';

class WaitingList extends React.Component {
    render() {
        return (
            <div className="row">
                <div className="column large-4 medium-6 small-12">
                    <p>
                        Sorry, your Reddit account doesn't have enough Reddit Karma to qualify for a free sign up.
                        Please add your email for a place on the waiting list
                    </p>
                    <AddToWaitingList />
                    <br />
                    <hr />
                    <p>Or click the button below to register with Facebook</p>
                    <a href="/connect/facebook" className="button SignUp--fb-button">Register with Facebook</a>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'waiting_list.html',
    component: WaitingList
};
