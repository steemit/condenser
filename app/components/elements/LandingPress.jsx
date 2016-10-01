import React from 'react'

export default class LandingPress extends React.Component {
	render() {
		return (
			<section>
				<div className="row text-center">
					<div className="Landing__header small-12 columns">
						<h2>Кому полезен Голос?</h2>
					</div>
				</div>
				<div className="row">
					<div className="small-12 medium-6 columns">
						<strong>Предприниматели</strong>
						<p>Воспользуйтесь преимуществом предоставляемым Золотым поставляет в те части света, где требуется стабильная валюта</p>
					</div>
					<div className="small-12 medium-6 columns">
						<strong>Создатели контента</strong>
						<p>Получите оценку и признание качества вашего труда аудиторией, которую вы желаете охватить</p>
					</div>
					<div className="small-12 medium-6 columns">
						<strong>Читатели</strong>
						<p>Прочитайте новые публикации и определите лучшее содержание для того, чтобы повысить Силу Голоса</p>
					</div>
					<div className="small-12 medium-6 columns">
						<strong>Социальные медиа</strong>
						<p>Интеграция с Голосом предоставляет пользователям возможность заработать на своих публикациях и своем времени проведенном на вашем сайте.</p>
					</div>
				</div>
				<div className="row">
					<div className="small-12 columns">
						<button className="button block">Регистрация</button>
					</div>
				</div>
				<hr />
			</section>
		)
	}
}
