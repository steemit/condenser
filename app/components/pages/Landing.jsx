import React from 'react'
import {connect} from 'react-redux';
import CountDowns from 'app/components/elements/LandingCountDowns'
import Distribution from 'app/components/elements/LandingDistribution'
import WhatIsGolos from 'app/components/elements/LandingWhatIsGolos'
import Faq from 'app/components/elements/LandingFaq'
import Team from 'app/components/elements/LandingTeam'
import Partners from 'app/components/elements/LandingPartners'
import { APP_NAME } from 'app/client_config';

class Landing extends React.Component {
    render() {
        return (
            <div className="Landing">
				<CountDowns />
				<WhatIsGolos />
				<Team />
				<Faq />
				{/* <Distribution button={buyGolosButton} /> */}
				<Partners />
            </div>
        )
    }
}

module.exports = {
    path: 'about',
	component: Landing
};
