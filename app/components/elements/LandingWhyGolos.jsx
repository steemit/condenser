import React from 'react'

export default class LandingWhyGolos extends React.Component {
	render() {
		return (
			<section className="WhyGolos">
				<div className="row text-center">
					<div className="WhyGolos__header small-12 columns">
						<h2 className="Landing__h2_blue" id="benefits">Кому полезен Голос?</h2>
						<span className="Landing__supporting-text">Децентрализованная социальная сеть для блоггеров и журналистов</span>
					</div>
				</div>
				{/* 65px от саппорт текста до картинок */}
				<div className="row WhyGolos__image">
					<div className="small-12">
						<img src={`images/landing/golos_is_usefull.png`} />
					</div>
				</div>
				<div className="row WhyGolos__reasons">
					<div className="small-12 medium-6 large-3 columns">
						<strong>Предприниматели</strong>
						<p>Воспользуйтесь преимуществом предоставляемым Золотым поставляет в те части света, где требуется стабильная валюта</p>
					</div>
					<div className="small-12 medium-6 large-3 columns">
						<strong>Создатели контента</strong>
						<p>Получите оценку и признание качества вашего труда аудиторией, которую вы желаете охватить</p>
					</div>
					<div className="small-12 medium-6 large-3 columns">
						<strong>Читатели</strong>
						<p>Прочитайте новые публикации и определите лучшее содержание для того, чтобы повысить Силу Голоса</p>
					</div>
					<div className="small-12 medium-6 large-3 columns">
						<strong>Социальные медиа</strong>
						<p>Интеграция с Голосом предоставляет пользователям возможность заработать на своих публикациях и своем времени проведенном на вашем сайте.</p>
					</div>
				</div>
				<hr />
			</section>
		)
	}
}
