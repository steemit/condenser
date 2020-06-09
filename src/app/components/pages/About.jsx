import React from 'react';
import { APP_NAME, APP_URL } from 'app/client_config';
import tt from 'counterpart';

class About extends React.Component {
    render() {
        return (
            <div className="About">
                <section className="AboutMission">
                    <div className="AboutMission__heading-container">
                        <h1 className="AboutMission__heading">
                            Steemit, Inc. Mission, Vision and Values
                        </h1>
                    </div>
                    <div className="AboutMission__section">
                        <div className="AboutMission__text-container">
                            <div className="AboutMission__square" />
                            <h2 className="AboutMission__heading">Mission</h2>
                            <p className="AboutMission__text">
                                Make great communities{' '}
                                <span className="line-break">
                                    with financial inclusion.
                                </span>
                            </p>

                            <div className="AboutMission__square AboutMission__square--2" />
                            <h2 className="AboutMission__heading">Vision</h2>
                            <p className="AboutMission__text">
                                Our vision is that steemit.com is a vibrant
                                communities web app, expanding the boundaries of
                                community coordination and online discussion by
                                incorporating cryptocurrency as incentives. The
                                company focuses on sustainability and
                                decentralization by lowering running costs and
                                increasing revenues, while increasing stickiness
                                by providing better homepage and community
                                tools, and is always demanding a secure and
                                safe, client-side signing experience.
                            </p>
                        </div>
                        <div className="AboutMission__image-container">
                            <img
                                className="AboutMission__img"
                                src="/images/about/mission.jpg"
                                alt
                            />
                        </div>
                    </div>
                    <div className="AboutMission__section">
                        <div className="AboutMission__text-container">
                            <div className="AboutMission__square" />
                            <h2 className="AboutMission__heading">Values</h2>
                            <h3 className="AboutMission__subheading">
                                Cryptocurrency adoption
                            </h3>
                            <p className="AboutMission__text">
                                Cryptocurrency adoption means advancing tools
                                that contribute to the consumers’ ability to be
                                aware of, use, hold and appreciate
                                cryptocurrency for its benefits, such as
                                sovereign value store and peer-to-peer payments.
                            </p>
                            <h3 className="AboutMission__subheading">
                                Sustainability
                            </h3>
                            <p className="AboutMission__text">
                                Sustainability means building real business from
                                steemit.com by way of advertisements and
                                programatically selling cryptocurrency assets
                                that Steemit, Inc. holds. Steemit, Inc., for
                                instance, has held lots of STEEM since 2016. The
                                company could have sold all of it over the past
                                several years, and instead continues to hold and
                                only sell programmatically, because we value the
                                potential of Steem. Advertising is also an
                                important part of our business for aligning
                                steemit.com with all its participants, such as
                                bloggers, content consumers, community builders
                                and our company’s shareholders, who all benefit
                                from increased stickiness and usage of
                                steemit.com. Both of these revenue
                                sources–capital gains from currency sales and
                                advertising revenue–are valuable to our
                                sustainability.
                            </p>
                            <h3 className="AboutMission__subheading">Health</h3>
                            <p className="AboutMission__text">
                                Health means aligning our organization leaders,
                                including employees and contractors, to
                                contribute in ways that advance our
                                organization, which means taking care of their
                                well being in return for their commitment to our
                                mission, vision and values.
                            </p>
                            <h3 className="AboutMission__subheading">Safety</h3>
                            <p className="AboutMission__text">
                                Safety means introducing changes slowly and
                                predictably with much testing. We greatly prefer
                                to move carefully and not break things,
                                especially when those things are near
                                steemit.com’s wallet functionality or when
                                proposing Steem hardforking upgrades, rather
                                than move fast while introducing breaking
                                changes.
                            </p>
                            <h3 className="AboutMission__subheading">
                                Security
                            </h3>
                            <p className="AboutMission__text">
                                Security means providing tools to our users of
                                steemit.com that mitigate risk when it comes to
                                cryptocurrency interactions. This principle has
                                led us to preferred use of client-side signing
                                for cryptocurrency use on steemit.com, which
                                means all transactions are pushed by the user
                                while Steemit, Inc. never has access to, nor
                                sees the user’s private keys; this keeps the
                                risk of cryptocurrency manageable for the user
                                because they can be assured they are the only
                                person responsible for their private key usage.
                                Security also comes from open-sourcing most of
                                our software. By open-sourcing, we’ve found
                                community engagement occurs to help audit and
                                review the published tools. Sometimes bugs and
                                pitfalls are discovered this way. Beyond that,
                                we publish our open-source software with an MIT
                                license, which means others can build from it
                                freely and can then advance the ecosystem in
                                parallel.
                            </p>
                        </div>
                        <div className="AboutMission__image-container">
                            <img
                                className="AboutMission__img"
                                src="/images/about/coin.jpg"
                                alt
                            />
                        </div>
                    </div>
                    <div className="AboutMission__section AboutMission__section--vision">
                        <div className="AboutMission__text-container">
                            <div className="AboutMission__square" />
                            <h2 className="AboutMission__heading">
                                Priorities
                            </h2>
                            <p className="AboutMission__text">
                                We strive to make steemit.com great for
                                communities and financial inclusion. This
                                includes focusing on the following:
                            </p>
                            <ul className="AboutMission__list">
                                <li className="AboutMission__list-item">
                                    Lower operating costs for sustainability and
                                    decentralization
                                </li>
                                <li className="AboutMission__list-item">
                                    Increasing advertisements revenue
                                </li>
                                <li className="AboutMission__list-item">
                                    Bite-size, visible changes, which includes
                                    increasing homepage functionality, such as
                                    the following:
                                </li>
                                <ul className="AboutMission__list">
                                    <li className="AboutMission__list-item">
                                        Updates Log
                                    </li>
                                    <ul className="AboutMission__list">
                                        <li className="AboutMission__list-item">
                                            Publish our development-recaps and
                                            updates-focused content via Update
                                            Log
                                        </li>
                                        <ul className="AboutMission__list">
                                            <li className="AboutMission__list-item">
                                                Communication of Steem
                                                developments
                                            </li>
                                            <li className="AboutMission__list-item">
                                                Communication of steemit.com
                                                developments
                                            </li>
                                            <li className="AboutMission__list-item">
                                                Communication of Steemit, Inc.
                                                developments
                                            </li>
                                            <li className="AboutMission__list-item">
                                                Communication of Steem Dapps /
                                                Ecosystem developments
                                            </li>
                                        </ul>
                                        <li className="AboutMission__list-item">
                                            Notify media outlets of additions to
                                            the Updates Log
                                        </li>
                                    </ul>
                                </ul>
                                <li className="AboutMission__list-item">
                                    Implementing Communities functionality
                                </li>
                            </ul>
                            <p>
                                What do our Mission, Vision and Values mean for
                                our Steem development?
                            </p>
                            <ul className="AboutMission__list">
                                <li className="AboutMission__list-item">
                                    We strive to make Steem great for online
                                    communities and financial inclusion. This
                                    includes focusing on the following items:
                                </li>
                                <ul className="AboutMission__list">
                                    <li className="AboutMission__list-item">
                                        Lowering costs for decentralization
                                    </li>
                                    <ul className="AboutMission__list">
                                        <li className="AboutMission__list-item">
                                            Such as with RocksDB enhancements
                                        </li>
                                        <li className="AboutMission__list-item">
                                            Lower costs of running full
                                            (economic) nodes
                                        </li>
                                        <li className="AboutMission__list-item">
                                            Lower costs of running steemit.com
                                            by lowering costs of hive nodes or
                                            new social plugins architecture
                                        </li>
                                    </ul>
                                    <li className="AboutMission__list-item">
                                        Propose hardforking upgrades for
                                        increasing beneficial functionality
                                    </li>
                                    <ul className="AboutMission__list">
                                        <li className="AboutMission__list-item">
                                            Tokens (SMTs)
                                        </li>
                                        <li className="AboutMission__list-item">
                                            Tokens with vote-able emissions
                                        </li>
                                        <li className="AboutMission__list-item">
                                            Additional token functions
                                        </li>
                                    </ul>
                                    <li className="AboutMission__list-item">
                                        Providing support
                                    </li>
                                    <ul className="AboutMission__list">
                                        <li className="AboutMission__list-item">
                                            Exchange support
                                        </li>
                                    </ul>
                                </ul>
                            </ul>
                            <p>
                                This is our principled focus for achieving
                                success. Anything we haven’t included in here,
                                and there are plenty, because opportunities are
                                so bountiful in this space, is not a focus for
                                us. We encourage you to contribute and seek
                                opportunities by picking up anything we aren’t
                                covering, particularly if it contributes to
                                STEEM and cryptocurrency adoption.
                            </p>
                        </div>
                        <div className="AboutMission__image-container">
                            <img
                                className="AboutMission__img"
                                src="/images/about/priorities.jpg"
                                alt
                            />
                        </div>
                    </div>
                    <div className="AboutMission__section">
                        <div className="AboutMission__text-container">
                            <div className="AboutMission__square" />
                            <h2 className="AboutMission__heading">
                                Disclaimer
                            </h2>
                            <p className="AboutMission__text">
                                Steemit Inc. (The “Company”), is a private
                                company that helps develop the open-source
                                software that powers steemit.com. The Company
                                may own various digital assets, including,
                                without limitation, quantities of
                                cryptocurrencies such as STEEM. These assets are
                                the sole property of the Company. Further, the
                                Company’s mission, vision, goals, statements,
                                actions, and core values do not constitute a
                                contract, commitment, obligation, or other duty
                                to any person, company or cryptocurrency network
                                user and are subject to change at any time.
                            </p>
                        </div>
                        <div className="AboutMission__image-container">
                            <img
                                className="AboutMission__img"
                                src="/images/about/talk.jpg"
                                alt
                            />
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

module.exports = {
    path: 'about.html',
    component: About,
};
