import React from 'react'

export default class LandingJoinUs extends React.Component {

	render() {

		const mainTexts = [
			'Вознаграждение за посты',
			'Вознаграждение за кураторство',
			'Вознаграждение за пользование',
			'Вознаграждения за сбережения',
			'Вознаграждения за майнинг',
			'Вознаграждения регистраторам'
		]
		const secondaryTexts = [
			'Получай ГОЛОС каждый раз, когда твой пост оценен другими',
			'Получай ГОЛОС будучи среди первых, кто голосует за популярный контент',
			'Голос вознаграждает тех, кто остается с ним надолго',
			'Вознаграждение в Золотых приносят стабильность',
			'Получай ГОЛОСА, присоединившись к пиринговой сети и подтверждая транзакции',
			'Получай долгосрочный доход за популярных блоггеров'
		]

		function renderItems() {
			return mainTexts.map((header, index) => {
				return 	<div key={header} className="JoinUs__item small-12 medium-6 large-6 columns">
							<div className="row">
								<div className="small-2 columns">
									<img src={`images/landing/${index + 1}.jpg`} />
								</div>
								<div className="small-10 columns">
									<strong>{header}</strong>
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
						<h2 className="blue" id="join">Присоединяйся!</h2>
						<span className="JoinUs__support-text">Получи 5 голосов за регистрацию</span>
						<br />
					</div>
				</div>
				<div className="row text-left JoinUs__reasons">
					{renderItems()}
				</div>
				<div className="row JoinUs__action">
					<div className="small-12 columns text-center">
						<a href="https://wiki.golos.io/2-rewards/posting_rewards.html" target="blank" className="button">Узнай больше!</a>
					</div>
				</div>
				<hr />
			</section>
		)
	}
}
