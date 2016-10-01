import React from 'react'
import CountDowns from 'app/components/elements/LandingCountDowns'
import WhatIsGolos from 'app/components/elements/LandingWhatIsGolos'
import JoinUs from 'app/components/elements/LandingJoinUs'
import Documentation from 'app/components/elements/LandingDocumentation'
import WhoWeAre from 'app/components/elements/LandingWhoWeAre'
import BlockchainRevolution from 'app/components/elements/LandingBlockchainRevolution'
import Faq from 'app/components/elements/LandingFaq'
import Team from 'app/components/elements/LandingTeam'
import Press from 'app/components/elements/LandingPress'
import Partners from 'app/components/elements/LandingPartners'
import Footer from 'app/components/elements/LandingFooter'

class Landing extends React.Component {

    render() {
        return (
            <div className="Landing">
                {/* <CountDowns />
                <WhatIsGolos /> */}
                <JoinUs />
                <hr />
                {/* <Documentation />
                <WhoWeAre />
                <BlockchainRevolution />
                <Faq />
                <Team />
                <Press />
                <Partners />
                <Footer /> */}
            </div>
        )
    }
}

module.exports = {
    path: 'landing.html',
    component: Landing
};
