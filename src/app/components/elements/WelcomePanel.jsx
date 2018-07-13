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
        return (
            <div className="welcomeWrapper">
                <div className="welcomeBanner">
                    <CloseButton onClick={this.setShowBannerFalse} />
                    <div className="row">
                        <div className="text-center welcomeImage small-12 show-for-small-only">
                            <img
                                className="heroImage"
                                src={require('app/assets/images/welcome-hero.png')}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="large-1 show-for-large" />
                        <div className="small-12 medium-6 large-5 welcomePitch">
                            <h2 className="fade-in--1">
                                {tt('navigation.intro_tagline')}
                            </h2>
                            <h4 className="fade-in--3">
                                {tt('navigation.intro_paragraph')}
                            </h4>
                            <div className="row buttonWrapper">
                                <a
                                    className="button button--primary fade-in--5"
                                    href={SIGNUP_URL}
                                >
                                    {' '}
                                    <b>{tt('navigation.sign_up')}</b>{' '}
                                </a>

                                <Link
                                    href="/faq.html"
                                    className="button ghost fade-in--7"
                                >
                                    <b>{tt('navigation.learn_more')}</b>
                                </Link>
                            </div>
                        </div>
                        <div className="text-center welcomeImage medium-6 large-5 show-for-medium">
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
