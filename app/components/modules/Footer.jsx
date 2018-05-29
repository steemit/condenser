import React from 'react'
import { connect } from 'react-redux'
import tt from 'counterpart'
import Icon from 'app/components/elements/Icon'
// import { getURL } from 'app/utils/URLConstants'
import { api } from 'golos-js'
import LocalizedCurrency from 'app/components/elements/LocalizedCurrency';

class Footer extends React.Component {

    state = {
        virtual_supply: 0,
    }

    componentDidMount() {
        const { price_per_golos } = this.props

        api.getDynamicGlobalProperties().then(res => {
            const virtual_supply = parseInt(parseInt(res.virtual_supply) * price_per_golos)
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
                    { name: <LocalizedCurrency amount={virtual_supply} short />, url: 'https://explorer.golos.io', className: 'big' }
                ],
            })
        }

        menuItems.push(
            {
                name: 'Golos.io',
                columnAlign: 'left',
                width: 'medium-4 space-between-columns',
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
                    { name: 'Telegram', url: 'https://t.me/golos_support', icon: 'new/telegram', size: '1_5x' }
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

export default connect(
    state => {
        let price_per_golos = undefined;
        const feed_price = state.global.get('feed_price');
        if (feed_price && feed_price.has('base') && feed_price.has('quote')) {
            const { base, quote } = feed_price.toJS()
            if (/ GBG$/.test(base) && / GOLOS$/.test(quote))
                price_per_golos = parseFloat(base.split(' ')[0]) / parseFloat(quote.split(' ')[0])
        }

        return {
            price_per_golos,
        }
    },
    null
)(Footer);
