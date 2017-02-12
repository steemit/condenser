import React from 'react'

export default class LandingWhyGolos extends React.Component {
	render() {
		return (
			<section className="WhyGolos">
				<div className="row text-center">
					<div className="WhyGolos__header small-12 columns">
						<h2 className="blue" id="benefits">Кому полезен Голос?</h2>
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
					<div className="small-12 medium-6 large-3 columns WhyGolos__reason">
						<strong>Предприниматели</strong>
						<p>Золотой работает везде где требуется стабильная валюта</p>
					</div>
					<div className="small-12 medium-6 large-3 columns WhyGolos__reason">
						<strong>Создатели контента</strong>
						<p>Получите оценку и признание качества вашего труда аудиторией</p>
					</div>
					<div className="small-12 medium-6 large-3 columns WhyGolos__reason">
						<strong>Читатели</strong>
						<p>Читайте лучший контент. Получайте Силу Голоса за его отбор</p>
					</div>
					<div className="small-12 medium-6 large-3 columns WhyGolos__reason">
						<strong>Социальные медиа</strong>
						<p>Интегрируйтесь с Голосом. Зарабатывайте на Вашем сайте</p>
					</div>
				</div>
				<hr />
			</section>
		)
	}
}
