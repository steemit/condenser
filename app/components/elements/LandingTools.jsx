import React from 'react'

export default class LandingJoinUs extends React.Component {

	render() {
		const mainTexts = [
			'Доска Почёта Голоса',
			'Мобильное приложение',
			'Расширение GolosNotify для браузера Google Chrome',
			'База данных Голоса',
			'Статистический инструмент',
			'Аналитический инструмент',
      		'Китовый сонар',
		]
		const secondaryTexts = [
			'Это место, где Вы сможете получить награды за свои достижения на Голосе. Здесь Вы также сможете увидеть награды других пользователей.',
			'Полноценное мобильное приложение для публикации, голосований, настройки профиля и другие не менее важные функциональные возможности',
			'Получайте уведомления обо всех действиях с Вашими постами и комментариями на golos.io. GolosNotify позволяет Вам получать оповещения о различных действиях с Вашими постами.',
			'Аналитический инструмент с помошью которого можно осуществлять различные выборки из базы данных Голоса',
			'Приложение создано для того, чтобы следить за активностью Вашего пользователя в Голосе',
			'С помошью данного ресурса можно увидеть в сыром виде структуры данных Голоса',
      		'Приложение демонстрирует активность пользователей с различными настройками'
		]
		const urls = [
			'http://golosboard.com/',
			'http://esteem.ws/',
			'https://chrome.google.com/webstore/detail/golosnotify-%D1%83%D0%B2%D0%B5%D0%B4%D0%BE%D0%BC%D0%BB%D0%B5%D0%BD%D0%B8%D1%8F-%D0%B4/abfmjjkkpeokoijnlnhmjobjhjkmaijg',
			'https://golosdb.com/',
			'http://golos.steemstats.com/',
			'http://golosd.com/',
      		'http://golos.loadsup.net/sonar/',
		]

		function renderItems() {
			return mainTexts.map((header, index) => {
				return 	<div key={header} className="JoinUs__item small-12 medium-6 large-6 columns">
							<div className="row">
								<div className="small-2 columns">
									<a target="_blank" href={urls[index]}><img src={`images/landing/l${index + 1}.jpg`} /></a>
								</div>
								<div className="small-10 columns">
									<strong><a target="_blank" href={urls[index]}>{header}</a></strong>
									<div>{secondaryTexts[index]}</div>
									<div className="clear" style={{clear: 'both'}}></div>
								</div>
							</div>
						</div>
			})
		}

		return (
			<section className="JoinUs">
				<div className="row text-center">
					<div className="small-12 columns">
						<h2 className="blue" id="join">Инструменты!</h2>
						<span className="JoinUs__support-text">Используй полезные инструменты и сервисы для Голоса</span>
						<br />
					</div>
				</div>
				<div className="row text-left JoinUs__reasons">
					{renderItems()}
				</div>
				<hr />
			</section>
		)
	}
}
