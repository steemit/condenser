import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import tt from 'counterpart';
import Icon from 'app/components/elements/Icon';

class FeedsNavigationMenu extends React.Component {
    render() {
        const { username } = this.props;
        const { routeTag } = this.props;
        const { category } = this.props;
        const { order } = this.props;

        let section;
        let { walletUrl } = this.props;

        walletUrl = walletUrl + '/@' + username + '/transfers';
        const settingsURL = '/@' + username + '/settings';

        if (routeTag === 'index') {
            section = '/trending';
        } else if (
            routeTag === 'category' &&
            category === '@' + username &&
            order === 'feed'
        ) {
            section = '/@' + username + '/feed';
        } else if (
            (routeTag === 'category' && category === 'my') ||
            routeTag === 'community_index'
        ) {
            section = '/trending/my';
        }

        const top_active = section;

        const tabLink = (tab, label, logo = null) => {
            const cls = tab === top_active ? 'active' : null;
            return (
                <Link to={tab} className={cls}>
                    {logo && <Icon name={logo} className="space-right" />}
                    {label}
                </Link>
            );
        };

        const top_menu = (
            <div className="row FeedsNavigation__top-menu">
                <div className="columns small-9 medium-12 medium-expand">
                    <ul className="menu" style={{ flexWrap: 'wrap' }}>
                        <li>
                            {tabLink('/trending', 'All Posts', 'library-books')}
                        </li>
                        <li>
                            {tabLink(
                                'Announcements',
                                'Announcements',
                                'announcement'
                            )}
                        </li>
                        {username && (
                            <li>
                                {tabLink(
                                    '/@' + username + '/feed',
                                    'My Friends',
                                    'account-heart'
                                )}
                            </li>
                        )}
                        {username && (
                            <li>
                                {tabLink(
                                    '/trending/my',
                                    'My Communities',
                                    'account-group'
                                )}
                            </li>
                        )}
                    </ul>
                </div>
                {username && (
                    <div className="columns shrink">
                        <ul className="menu" style={{ flexWrap: 'wrap' }}>
                            <li>
                                {tabLink(
                                    '/@' + username,
                                    tt('g.profile'),
                                    'profile'
                                )}
                            </li>
                            <li>
                                <a href={walletUrl} target="_blank">
                                    <Icon
                                        name="wallet_2"
                                        className="space-right"
                                    />
                                    Wallet
                                </a>
                            </li>
                            <li>
                                {tabLink(
                                    settingsURL,
                                    tt('g.settings'),
                                    'account-settings-variant'
                                )}
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        );

        return (
            <div className="FeedsNavigation__top-nav row expanded">
                {top_menu}
            </div>
        );
    }
}

export default connect(state => {
    const walletUrl = state.app.get('walletUrl');
    const username =
        state.user.getIn(['current', 'username']) ||
        state.offchain.get('account');
    return {
        walletUrl,
        username,
    };
})(FeedsNavigationMenu);
