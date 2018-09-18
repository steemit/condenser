import React from 'react';
import { connect } from 'react-redux';
import tt from 'counterpart';
import { api } from 'golos-js';
import Icon from 'app/components/elements/Icon';
import { TERMS_OF_SERVICE_URL } from 'app/client_config';
import { renderValue } from 'src/app/helpers/currency';

class Footer extends React.Component {
    state = {
        currentSupply: 0,
    };

    async componentDidMount() {
        const { pricePerGolos } = this.props;

        const res = await api.getDynamicGlobalProperties();
        this.setState({
            currentSupply: Math.floor(parseInt(res.current_supply) / pricePerGolos),
        });
    }

    renderItems(items) {
        if (items[0].icon) {
            return (
                <ul>
                    <li className="social-icons">
                        {items.map((item, i) => (
                            <a key={i} href={item.url} target="blank">
                                <Icon name={item.icon} size={item.size} />
                            </a>
                        ))}
                    </li>
                </ul>
            );
        }

        if (Array.isArray(items[0])) {
            return (
                <div className="row medium-up-1 large-up-2">
                    {items.map((chunk, ic) => (
                        <ul className="columns" key={ic}>
                            {chunk.map((item, i) => (
                                <li key={i} className={item.className}>
                                    <a href={item.url} target="blank">
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ))}
                </div>
            );
        }

        return (
            <ul>
                {items.map((item, i) => (
                    <li key={i} className={item.className}>
                        <a href={item.url} target="blank">
                            {item.name}
                        </a>
                    </li>
                ))}
            </ul>
        );
    }

    render() {
        const { currentSupply } = this.state;

        const menuItems = [];

        if (currentSupply > 0) {
            menuItems.push({
                name: 'Всего выплачено',
                columnAlign: 'left',
                width: 'medium-3',
                items: [
                    {
                        name: renderValue(currentSupply, 'short'),
                        url: 'https://explorer.golos.io',
                        className: 'big',
                    },
                ],
            });
        }

        menuItems.push(
            {
                name: 'Golos.io',
                columnAlign: 'left',
                width: 'medium-4 space-between-columns',
                items: [
                    [
                        {
                            name: tt('navigation.welcome'),
                            url: '/welcome',
                        },
                        {
                            name: tt('navigation.faq'),
                            url: '/faq',
                        },
                        {
                            name: tt('g.golos_fest'),
                            url: '/@golosio',
                        },
                        // { name: 'Подписка на рассылку', url: '' },
                        {
                            name: tt('g.team'),
                            url: '/about#team',
                        },
                    ],
                    [
                        {
                            name: tt('navigation.feedback'),
                            url: '/submit?type=submit_feedback',
                        },
                        {
                            name: tt('navigation.privacy_policy'),
                            url: '/ru--konfidenczialxnostx/@golos/politika-konfidencialnosti',
                        },
                        {
                            name: tt('navigation.terms_of_service'),
                            url: TERMS_OF_SERVICE_URL,
                        },
                    ],
                ],
            },
            {
                name: 'Социальные сети',
                columnAlign: 'left',
                width: 'medium-3',
                items: [
                    {
                        name: 'Facebook',
                        url: 'https://www.facebook.com/www.golos.io',
                        icon: 'new/facebook',
                        size: '1_5x',
                    },
                    {
                        name: 'VK',
                        url: 'https://vk.com/goloschain',
                        icon: 'new/vk',
                        size: '2x',
                    },
                    {
                        name: 'Telegram',
                        url: 'https://t.me/golos_support',
                        icon: 'new/telegram',
                        size: '1_5x',
                    },
                ],
            },
            {
                name: 'Приложения',
                columnAlign: 'left',
                width: 'medium-2',
                items: [
                    // { name: 'IOS', url: '' },
                    {
                        name: 'Android',
                        url: 'https://play.google.com/store/apps/details?id=io.golos.golos',
                    },
                ],
            }
        );

        return (
            <section className="Footer">
                <div className="Footer__menus">
                    <div className="row" id="footer">
                        {this._renderMenus(menuItems)}
                    </div>
                </div>
                <div className="Footer__description">
                    <div className="row">
                        <div className="small-12 medium-12 columns">
                            <span className="text-left">
                                © 2018 Golos.io - социальная платформа, сообщество блогеров,
                                медиасеть, разработанная на Медиаблокчейне ГОЛОС
                            </span>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    _renderMenus(menuItems) {
        return menuItems.map((menu, index) => (
            <div key={index} className={`small-12 ${menu.width} columns text-${menu.columnAlign}`}>
                <strong>{menu.name}</strong>
                {this.renderItems(menu.items)}
            </div>
        ));
    }
}

export default connect(state => {
    return {
        pricePerGolos: state.data.rates.actual.GBG.GOLOS,
    };
})(Footer);
