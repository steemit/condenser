/* eslint react/prop-types: 0 */
import React from 'react';
import Tooltip from 'app/components/elements/Tooltip';
import { injectIntl } from 'react-intl';
import tt from 'counterpart';

class ThirdPartyAppName extends React.Component {
    constructor() {
        super();

        // https://raw.githubusercontent.com/bonustrack/steemscript/master/apps.json
        this.knownThirdPartyDapps = {
            appics: {
                name: 'APPICS',
                homepage: 'https://appics.com',
            },
            busy: {
                name: 'Busy',
                homepage: 'https://busy.org',
                url_scheme: 'https://busy.org/@{username}/{permlink}',
            },
            bsteem: {
                name: 'bSteem',
                homepage: 'http://bsteem.com',
            },
            esteem: {
                name: 'eSteem',
                homepage: 'https://esteem.ws',
            },
            fundition: {
                name: 'Fundition',
                homepage: 'https://fundition.io',
                url_scheme: 'https://fundition.io/#!/@{username}/{permlink}',
            },
            chainbb: {
                name: 'chainBB',
                homepage: 'https://chainbb.com',
                url_scheme:
                    'https://chainbb.com/{category}/@{username}/{permlink}',
            },
            utopian: {
                name: 'Utopian',
                homepage: 'https://utopian.io',
                url_scheme:
                    'https://utopian.io/{category}/@{username}/{permlink}',
            },
            dtube: {
                name: 'DTube',
                homepage: 'https://d.tube',
                url_scheme: 'https://d.tube/#!/v/{username}/{permlink}',
            },
            dlive: {
                name: 'DLive',
                homepage: 'https://www.dlive.io',
                url_scheme:
                    'https://www.dlive.io/#/livestream/{username}/{permlink}',
            },
            dmania: {
                name: 'dMania',
                homepage: 'https://dmania.lol',
                url_scheme: 'https://dmania.lol/post/{username}/{permlink}',
            },
            dsound: {
                name: 'DSound',
                homepage: 'https://dsound.audio',
                url_scheme: 'https://dsound.audio/#/@{username}/{permlink}',
            },
            steepshot: {
                name: 'Steepshot',
                homepage: 'https://steepshot.io',
                url_scheme:
                    'https://alpha.steepshot.io/post/{category}/@{username}/{permlink}',
            },
            zappl: {
                name: 'Zappl',
                homepage: 'https://zappl.com',
                url_scheme:
                    'https://zappl.com/{category}/{username}/{permlink}',
            },
            partiko: {
                name: 'Partiko',
                homepage: 'https://partiko.app',
            },
            steemkr: {
                name: 'Steemkr',
                homepage: 'https://steemkr.com',
                url_scheme:
                    'https://steemkr.com/{category}/@{username}/{permlink}',
            },
            steemjs: {
                name: 'Steem.js',
                homepage: 'https://github.com/steemit/steem-js',
            },
            steempeak: {
                name: 'SteemPeak',
                homepage: 'https://steempeak.com',
                url_scheme:
                    'https://steempeak.com/{category}/@{username}/{permlink}',
            },
            steempress: {
                name: 'SteemPress',
                homepage: 'https://wordpress.org/plugins/steempress/',
            },
            strimi: {
                name: 'Strimi',
                homepage: 'https://strimi.pl',
                url_scheme:
                    'https://strimi.pl/{category}/@{username}/{permlink}',
            },
            steemhunt: {
                name: 'Steemhunt',
                homepage: 'https://steemhunt.com',
                url_scheme: 'https://steemhunt.com/@{username}/{permlink}',
            },
            'memeit.lol': {
                name: 'Memeit.LOL',
                homepage: 'https://memeit.lol',
                url_scheme: 'https://memeit.lol/@{username}/{permlink}',
            },
            steemia: {
                name: 'Steemia',
                homepage: 'https://steemia.io',
            },
            tasteem: {
                name: 'Tasteem',
                homepage: 'https://tasteem.io',
            },
            travelfeed: {
                name: 'TravelFeed',
                homepage: 'https://travelfeed.io',
                url_scheme: 'https://travelfeed.io/@{username}/{permlink}',
            },
            hede: {
                name: 'Hede.io',
                homepage: 'https://hede.io',
                url_scheme: 'https://hede.io/hede-io/@{username}/{permlink}',
            },
            actifit: {
                name: 'Actifit',
                homepage: 'https://actifit.io',
            },
            ulogs: {
                name: 'Ulogs',
                homepage: 'https://ulogs.org',
                url_scheme: 'https://ulogs.org/@{username}/{permlink}',
            },
            musing: {
                name: 'Musing',
                homepage: 'https://musing.io',
                url_scheme: 'https://musing.io/q/{username}/{permlink}',
            },
            'guc-desktop': {
                name: 'GUC',
            },
        };
    }

    render() {
        let { jsonMetadata } = this.props;
        console.log(jsonMetadata);
        jsonMetadata = JSON.parse(jsonMetadata);
        const [appName] = jsonMetadata.app.split('/');

        if (this.knownThirdPartyDapps.hasOwnProperty(appName)) {
            const thirdPartyDappName = this.knownThirdPartyDapps[appName].name;
            const thirdPartyDappHomepage = this.knownThirdPartyDapps[appName]
                .homepage;

            return (
                <Tooltip
                    t={tt('g.posted_with_dapp', {
                        appName: thirdPartyDappName,
                    })}
                    className="dapp_name"
                >
                    {thirdPartyDappHomepage ? (
                        <a href={thirdPartyDappHomepage} target="_blank">
                            {thirdPartyDappName}
                        </a>
                    ) : (
                        thirdPartyDappName
                    )}
                </Tooltip>
            );
        }

        return null;
    }
}

export default injectIntl(ThirdPartyAppName);
