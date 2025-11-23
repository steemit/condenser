import React from 'react';
import CloseButton from 'app/components/elements/CloseButton';
import { Link } from 'react-router';
import tt from 'counterpart';
import { SIGNUP_URL } from 'shared/constants';

export default class WelcomePanel extends React.Component {
    constructor(props) {
        super(props);
        this.setShowBannerFalse = props.setShowBannerFalse;
    }

    render() {
        const signup = (
            <a className="button ghost fade-in--5" href={SIGNUP_URL}>
                {tt('navigation.sign_up')}
            </a>
        );

        const learn = (
            <Link href="/faq.html" className="button ghost fade-in--7">
                {tt('navigation.learn_more')}
            </Link>
        );

        return (
            <div className="welcomeWrapper">
                <div className="welcomeBanner">
                    <CloseButton onClick={this.setShowBannerFalse} />
                    <div className="row">
                        <div className="large-2 medium-1 show-for-medium" />
                        <div className="small-12 medium-6 large-5 welcomePitch">
                            <h2 className="fade-in--1">
                                Communities Without Borders
                                {/*tt('navigation.intro_tagline')*/}
                            </h2>
                            <h4 className="fade-in--3">
                                {
                                    'A social network owned and operated by its users, '
                                }
                                {'powered by '}
                                <a href="https://steem.io">Steem</a>.
                                {/*tt('navigation.intro_paragraph')*/}
                            </h4>
                            <div>
                                {signup} {learn}
                            </div>
                        </div>
                        <div className="text-center welcomeImage medium-4 large-3 show-for-medium">
                            <img
                                className="heroImage"
                                src={require('app/assets/images/welcome-hero.png')}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
