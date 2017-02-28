import React from 'react'
import {connect} from 'react-redux';
import CountDowns from 'app/components/elements/LandingCountDowns'
import Distribution from 'app/components/elements/LandingDistribution'
import WhatIsGolos from 'app/components/elements/LandingWhatIsGolos'
import Tools from 'app/components/elements/LandingTools'
import Documentation from 'app/components/elements/LandingDocumentation'
import WhoWeAre from 'app/components/elements/LandingWhoWeAre'
import BlockchainRevolution from 'app/components/elements/LandingBlockchainRevolution'
import Faq from 'app/components/elements/LandingFaq'
import WhyGolos from 'app/components/elements/LandingWhyGolos'
import Team from 'app/components/elements/LandingTeam'
import Press from 'app/components/elements/LandingPress'
import Partners from 'app/components/elements/LandingPartners'
import Footer from 'app/components/elements/LandingFooter'
import { APP_NAME } from 'config/client_config';
// let WOW
// if (process.env.BROWSER) WOW = require('wowjs/dist/wow.js')

/*
    NOTE there was so little time and so much todo, thats why code is clumsy and
    there is little to no comments
	TODO add comments
*/

// format date properly
function createDate(year, month, day, hours, minutes) {
	//const today = new Date()
	//const mins = (minutes == 0 || !minutes) ? 0 : today.getMinutes()
	const date = new Date(Date.UTC(year, month, day, hours || 0, minutes || 0, 0));
	return date
}

export const blockchainStartAt = createDate(2016, 9, 18, 11, 0)
export const crowdsaleStartAt = createDate(2016, 10, 1, 11, 0)
export const crowdsaleEndAt = createDate(2016, 11, 4, 11, 0)

class Landing extends React.Component {

	componentWillMount() { if (process.env.BROWSER) document.title = APP_NAME + ' - ICO' }

	// componentDidMount() { if (process.env.BROWSER && WOW) new WOW().init() }

    render() {
		const {current_account_name} = this.props
		const buyGolosLink = current_account_name ? `/@${current_account_name}/crowdsale` : '/create_account'
		const buyGolosButton = <a href={buyGolosLink} className="button Landing__button_big BuyGolosButton">Купи <strong>Силу Голоса</strong></a>
		// TODO move this constant into <CountDowns />
		const prefill = crowdsaleStartAt > Date.now()

        return (
            <div className="Landing">
				<CountDowns
					prefill={prefill}
					crowdsaleStartAt={crowdsaleStartAt}
					blockchainStartAt={blockchainStartAt}
					crowdsaleEndAt={crowdsaleEndAt}
					button={buyGolosButton}
				/>
				<WhatIsGolos />
				<Faq />
				<Distribution button={buyGolosButton} />
				<Tools />
				<Team />
				<Partners />
				<Footer />
				{/*
				<WhyGolos />
				<JoinUs />
				<BlockchainRevolution />
				<Documentation />
				<WhoWeAre />
				<Press button={buyGolosButton} />
				*/}
            </div>
        )
    }
}

module.exports = {
    path: 'about',
    component: connect(
	    state => {
	        const current_user = state.user.get('current');
	        const current_account_name = current_user ? current_user.get('username') : state.offchain.get('account');
	        return { current_account_name }
	    }
	)(Landing)
};
