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
							<img src={`images/landing/${index + 1}.jpg`} />
							<strong>{header}</strong>
							<div>{secondaryTexts[index]}</div>
						</div>
			})
		}
		// 100px между хеадером и риазонс
		// 40px от картинки до текста слева
		// 13px от толстой надписи до текста
		// 70px марджин боттон между элементами
		return (
			<section className="JoinUs">
				<div className="row text-center">
					<div className="small-12 columns">
						<h2 className="Landing__h2_red">Присоединяйся</h2>
						<span className="JoinUs__support-text">Получи 6 голосов за регистрацию</span>
            <br />
						<span className="JoinUs__support-text-2">Приведи друзей и получите дополнительные голоса</span>
					</div>
				</div>
				<div className="row text-left JoinUs__reasons">
					{renderItems()}
					{/* <div className="JoinUs__item small-12 medium-6 columns">
						<strong>Вознаграждение за посты</strong>
						<p>Получай ГОЛОС каждый раз, когда твой пост оценен другими</p>
					</div> */}
				</div>
				<div className="row JoinUs__action">
					<div className="small-12 columns text-center">
						<a href="https://wiki.golos.io/2-rewards/posting_rewards.html" target="blank" className="button">Узнать больше</a>
					</div>
				</div>
				<hr />
			</section>
		)
	}
}
