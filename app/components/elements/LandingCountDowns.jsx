import React from 'react'
import ReactCountdownClock from 'react-countdown-clock'

export default class LandingCountDowns extends React.Component {
	render() {
		const Countdown = params => {
			return <ReactCountdownClock
					seconds={60}
					color="#000"
					alpha={0.9}
					size={300} />
		}

		return (
			<div>
				{/* TODO get rid of rows? THey are not neccesery */}
				<div className="row text-center">
					<div className="Landing__header small-12 columns">
						<span className="Landing__header">Каждый Голос имеет значение!</span>
						<h1>Децентрализованная социальная сеть для блоггеров и журналистов</h1>
						<button className="button block"> Купи Силу Голоса </button>
						<small>Продажа Голоса закончиться при достижении 3300 ฿</small>
					</div>
				</div>
				<div className="row text-center">
					<div className="small-12 medium-4 columns">
						<span>Продажа Силы Голоса закончится</span>
						{Countdown()}
					</div>
					<div className="small-12 medium-4 columns">
						<span>Собрано биткоинов</span>
						<small>Текущий бонус <span className="text-red">+ 25%</span></small>
						{Countdown()}
					</div>
					<div className="small-12 medium-4 columns">
						<span>Бонус уменьшится: <strong>до 20%</strong></span>
						{Countdown()}
					</div>
				</div>
				<div className="row">
					<div className="small-12 medium-6 columns text-left">
						<a href="#" className="button secondary">White Paper</a>
						<a href="#" className="button secondary">Дорожная карта проекта</a>
					</div>
					<div className="small-12 medium-6 columns text-right">
						<p>Социальные сети: FB && TW</p>
					</div>
				</div>
				<hr />
			</div>
		)
	}
}
