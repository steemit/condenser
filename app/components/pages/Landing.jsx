import React from 'react'
import CountDowns from 'app/components/elements/LandingCountDowns'
import Distribution from 'app/components/elements/LandingDistribution'
import WhatIsGolos from 'app/components/elements/LandingWhatIsGolos'
import JoinUs from 'app/components/elements/LandingJoinUs'
import Documentation from 'app/components/elements/LandingDocumentation'
import WhoWeAre from 'app/components/elements/LandingWhoWeAre'
import BlockchainRevolution from 'app/components/elements/LandingBlockchainRevolution'
import Faq from 'app/components/elements/LandingFaq'
import WhyGolos from 'app/components/elements/LandingWhyGolos'
import Team from 'app/components/elements/LandingTeam'
import Press from 'app/components/elements/LandingPress'
import Partners from 'app/components/elements/LandingPartners'
import Footer from 'app/components/elements/LandingFooter'

/*
    NOTE there was so little time and so much todo, thats why code is clumsy and
    there is little to no comments
*/

// format date properly
function createDate(month, day) {
	const today = new Date()
	const date = new Date(2016, month, day, today.getHours(), today.getMinutes(), today.getSeconds())
	return date
}

const buyGolosButton = <a href="" className="button Landing__button_big">Купи <strong>Силу Голоса</strong></a>

const crowdsaleStartAt = createDate(9, 16)
const crowdsaleEndAt = createDate(10, 16)

class Landing extends React.Component {

    render() {
        // if crodwsale hasn't started yet render countdown til crodwsale start
        // if (crowdsaleStartAt > Date.now()) return <CountDowns prefill crowdsaleStartAt={crowdsaleStartAt} />

        return (
            <div className="Landing text-center">
                <CountDowns crowdsaleStartAt={crowdsaleStartAt} crowdsaleEndAt={crowdsaleEndAt} button={buyGolosButton} />
                <hr />
                <Distribution />
                <hr />
                <WhatIsGolos />
                <hr />
                <JoinUs />
                <hr />
                <Documentation />
                <hr />
                <WhoWeAre />
                <hr />
                <BlockchainRevolution />
                <hr />
                <Faq />
                <hr />
                <Team />
				<hr />
                <WhyGolos />
				<hr />
				<Partners />
				<hr />
                <Press button={buyGolosButton} />
                <hr />
                <Footer />
                <hr />
            </div>
        )
    }
}

module.exports = {
    path: 'landing.html',
    component: Landing
};
