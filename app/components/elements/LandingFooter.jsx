import React from 'react'

export default class LandingFooter extends React.Component {

	render() {

		const menuHeaders = ['Используем Голос', 'Правовые документы', 'Сообщества']
		const columnsAlign = ['left', 'left', 'right']
		const menuItems = [
			[
				{name: 'Приложение'},
				{name: 'Block Explorer'},
				{name: 'Документация', url: 'https://wiki.golos.io/'},
				{name: 'Github', url: 'https://github.com/goloschain'}
			],
			[
				{name: 'Условия проведения краудфандинга'},
				{name: 'Правила пользования'}
			],
			[
				{name: 'Chat', url: 'https://chat.golos.io/'},
				{name: 'Facebook'},
				{name: 'VK'},
				{name: 'Twitter', url: 'https://twitter.com/goloschain'},
				{name: 'Bitcointalk'}
			]
		]

		function renderMenus(align) {
			return menuHeaders.map((header, index) => {
				return  <div key={index} className={`small-12 medium-4 columns text-${columnsAlign[index]}`}>
							<strong>{header}</strong>
							<ul>
								{
									menuItems[index].map((item, i) => {
										return  <li key={i}>
													<a href={item.url} target="blank">{item.name}</a>
												</li>
									})
								}
							</ul>
						</div>
			})
		}

		return (
			<section className="LandingFooter" id="contacts">
				<div className="row">
					{renderMenus()}
				</div>
				<div className="row text-left LandingFooter__description">
					<div className="small-6 columns">
						2016 Golos.io
					</div>
					<div className="small-6 columns">
						Децентрализованная социальная сеть для блоггеров и журналистов
					</div>
				</div>
			</section>
		)
	}
}
