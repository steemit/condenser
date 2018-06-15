import React from 'react'

export default class LandingJoinUs extends React.Component {

	render() {
		const mainTexts = [
			'Доска Почёта Голоса',
			'Приложение Golos.io для Android',
			'Расширение GolosNotify для браузера Google Chrome',
			'База данных Голоса',
			'Статистический инструмент',
      'Китовый сонар',
			'Golos Explorer',
			'SteepShot',
			'GoldVoice.club',
			'MapalaNet',
			'OnePlace',
			'CPEDA.SPACE',
			'База знаний Golos Wiki',
			'Фотопремия Golos Photography Awards',
			'Pokupo',
			'Golos today',
			'Статистика аккаунта'
		]
		const secondaryTexts = [
			'Это место, где Вы сможете получить награды за свои достижения на Голосе. Здесь Вы также сможете увидеть награды других пользователей.',
			'Мобильное приложение для Андройд для чтения, публикации, голосований, коментирования.',
			'Получайте уведомления обо всех действиях с Вашими постами и комментариями на golos.io. GolosNotify позволяет Вам получать оповещения о различных действиях с Вашими постами.',
			'Приложение создано для того, чтобы следить за активностью Вашего пользователя в Голосе',
			'С помошью данного ресурса можно увидеть в сыром виде структуры данных Голоса',
      'Приложение демонстрирует активность пользователей с различными настройками',
			'Сервис для просмотра транзакций в блокчейне Голос в реальном времени и поиска информации по ним',
			'Социальная платформа, вознаграждающая пользователей за публикации фотографий о своей жизни и окружающем мире.',
			'Cоциальная сеть',
			'Cообщество самостоятельных путешественников',
			'Веб-клиент для блокчейнов Golos и Steem',
			'Cоциальная сеть на блокчейне Голос',
			'Вики является результатом коллективного труда. Каждый может поучаствовать в ее развитии',
			'Первая криптовалютная награда в области фотографии, созданная на базе медиа-блокчейна «Голос»',
			'Платформа для создания интерент магазина за 10 минут и 0 рублей без абонентской платы',
			'Веб-клиент для блокчейна Golos',
			'Сервис для просмотра статистики аккаунта'
		]
		const urls = [
			'http://golosboard.com/',
			'https://play.google.com/store/apps/details?id=io.golos.golos',
			'https://chrome.google.com/webstore/detail/golosnotify-%D1%83%D0%B2%D0%B5%D0%B4%D0%BE%D0%BC%D0%BB%D0%B5%D0%BD%D0%B8%D1%8F-%D0%B4/abfmjjkkpeokoijnlnhmjobjhjkmaijg',
			'https://golosdb.com/',
			'http://golos.steemstats.com/',
      'http://golos.loadsup.net/sonar/',
			'https://explorer.golos.io/',
			'https://steepshot.io/',
			'https://goldvoice.club/',
			'http://mapala.net',
			'https://oneplace.media/g',
			'https://cpeda.space/socnet/',
			'https://wiki.golos.io/',
			'http://golosphoto.ru/',
			'https://pokupo.ru',
			'https://golos.today',
			'http://golos.accusta.tk/'
		]

		function renderItems() {
			return mainTexts.map((header, index) => {
				return 	<div key={header} className="JoinUs__item small-12 medium-6 large-6 columns">
					<div className="row row align-middle">
								<div className="small-2 columns">
									<a target="_blank" href={urls[index]}><img src={`images/landing/l${index + 1}.jpg`} alt="" /></a>
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
					<div className="JoinUs__more small-12 text-center">
						<a href="http://chainstore.io" target="_blank" className="button">Больше приложений для блокчейна Голос</a>
					</div>
				</div>
				<hr />
			</section>
		)
	}
}
