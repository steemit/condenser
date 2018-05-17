import React from 'react'
import tt from 'counterpart'
import Icon from 'app/components/elements/Icon'
// import { getURL } from 'app/utils/URLConstants'
import { api } from 'golos-js'
import LocalizedCurrency, { localizedCurrency } from 'app/components/elements/LocalizedCurrency';

export default class Footer extends React.Component {

    state = {
        virtual_supply: 0,
    }

    componentDidMount() {
        api.getDynamicGlobalProperties().then(res => {
            const virtual_supply = parseInt(res.virtual_supply)
            this.setState({ virtual_supply })
        });
    }

    renderMenus(menuItems) {
        return menuItems.map((menu, index) => {
            return <div key={index} className={`small-12 ${menu.width} columns text-${menu.columnAlign}`}>
                <strong>{menu.name}</strong>
                {this.renderItems(menu.items)}
            </div>
        })
    }

    renderItems(items) {
        if (items[0].icon) {
            return (
                <ul>
                    <li key="0" className="social-icons">
                        {items.map((item, i) => (
                            <a key={i} href={item.url} target="blank"><Icon name={item.icon} size={item.size} /></a>
                        ))}
                    </li>
                </ul>
            )
        }

        if (Array.isArray(items[0])) {
            return (
                <div className="row medium-up-1 large-up-2">
                    {items.map((chunk, ic) => (
                        <ul className="columns" key={ic}>
                            {chunk.map((item, i) => <li key={i} className={item.className}><a href={item.url} target="blank">{item.name}</a></li>)}
                        </ul>
                    ))}
                </div>
            )
        }

        return (
            <ul>
                {items.map((item, i) => <li key={i} className={item.className}><a href={item.url} target="blank">{item.name}</a></li>)}
            </ul>
        )
    }

    render() {
        const { virtual_supply } = this.state

        const menuItems = []

        if (virtual_supply > 0) {
            menuItems.push({
                name: 'Всего выплачено',
                columnAlign: 'left',
                width: 'medium-3',
                items: [
                    { name: <LocalizedCurrency amount={virtual_supply}/>, className: 'big' }
                ],
            })
        }

        menuItems.push(
            {
                name: 'Golos.io',
                columnAlign: 'left',
                width: 'medium-4',
                items: [[
                    { name: tt("navigation.welcome"), url: '/welcome' },
                    { name: tt('g.golos_fest'), url: '/@golosio' },
                    // { name: 'Подписка на рассылку', url: '' },
                    { name: tt('g.team'), url: '/about#team' },
                ],
                [
                    { name: tt('navigation.feedback'), url: '/submit.html?type=submit_feedback' },
                    { name: tt("navigation.privacy_policy"), url: '/ru--konfidenczialxnostx/@golos/politika-konfidencialnosti' },
                    { name: tt("navigation.terms_of_service"), url: '/legal/terms_of_service.pdf' }
                ]],
            },
            {
                name: 'Социальные сети',
                columnAlign: 'left',
                width: 'medium-3',
                items: [
                    { name: 'Facebook', url: 'https://www.facebook.com/www.golos.io', icon: 'new/facebook', size: '1_5x' },
                    { name: 'VK', url: 'https://vk.com/goloschain', icon: 'new/vk', size: '2x' },
                    { name: 'Telegram', url: 'https://t.me/goloschain', icon: 'new/telegram', size: '1_5x' }
                ],
            },
            {
                name: 'Приложения',
                columnAlign: 'left',
                width: 'medium-2',
                items: [
                    // { name: 'IOS', url: '' },
                    { name: 'Android', url: 'https://play.google.com/store/apps/details?id=io.golos.golos' }
                ],
            }
        )

        return (
            <section className="Footer">
                <div className="Footer__menus">
                    <div className="row" id="footer">
                        {this.renderMenus(menuItems)}
                    </div>
                </div>
                <div className="Footer__description">
                    <div className="row">
                        <div className="small-12 medium-12 columns">
                            <span className="text-left">© 2018 Golos.io - социальная платформа, сообщество блогеров, медиасеть - разработанная на Медиаблокчейне ГОЛОС</span>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}
