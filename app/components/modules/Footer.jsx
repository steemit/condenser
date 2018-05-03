import React from 'react'
import tt from 'counterpart';
import Icon from 'app/components/elements/Icon';
import { getURL } from 'app/utils/URLConstants'

export default class Footer extends React.Component {

    render() {
        const menuItems = [
            {
                name: 'Всего выплачено',
                columnAlign: 'left',
                width: 'medium-3',
                items: [
                    { name: '$ 2.7М', className: 'big' }
                ],
            },
            {
                name: 'Golos.io',
                columnAlign: 'left',
                width: 'medium-4',
                items: [[
                    { name: tt("navigation.welcome"), url: '/welcome' },
                    { name: tt('g.golos_fest'), url: '/@golosio' },
                    { name: 'Подписка на рассылку', url: '' },
                    { name: tt('g.team'), url: '/about#team' },
                ],
                [
                    { name: tt('navigation.feedback'), url: '/submit.html?type=submit_feedback' },
                    { name: tt("navigation.privacy_policy"), url: getURL('PRIVACY_POLICY_URL') },
                    { name: tt("navigation.terms_of_service"), url: getURL('TERMS_OF_SERVICE_URL') }
                ]],
            },
            {
                name: 'Социальные сети',
                columnAlign: 'left',
                width: 'medium-3',
                items: [
                    { name: 'Facebook', url: 'https://www.facebook.com/www.golos.io', icon: 'new/facebook', size: '1_5x' },
                    { name: 'VK', url: 'https://vk.com/goloschain', icon: 'new/vk', size: '2x' },
                    { name: 'Telegram', url: 'https://t.me/goloschain', icon: 'new/telegram', size: '1_5x' },
                    // { name: 'Twitter', url: 'https://twitter.com/goloschain', icon: 'data:image/png;base64,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' },
                    // { name: 'Bitcointalk', url: 'https://bitcointalk.org/index.php?topic=1624364.0', icon: 'data:image/png;base64,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' },
                ],
            },
            {
                name: 'Приложения',
                columnAlign: 'left',
                width: 'medium-2',
                items: [
                    { name: 'IOS', url: '' },
                    { name: 'Android', url: 'https://play.google.com/store/apps/details?id=io.golos.golos' }
                ],
            }
        ]

        function renderMenus(align) {
            return menuItems.map((menu, index) => {
                return <div key={index} className={`small-12 ${menu.width} columns text-${menu.columnAlign}`}>
                    <strong>{menu.name}</strong>
                    {renderItems(menu.items)}
                </div>
            })
        }

        function renderItems(items) {
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

        return (
            <section className="Footer">
                <div className="Footer__menus">
                    <div className="row" id="footer">
                        {renderMenus()}
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
