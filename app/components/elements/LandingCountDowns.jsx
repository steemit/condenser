import React, { PropTypes } from 'react'
import CountDown from 'app/components/elements/CountDown'

const stages = [25, 20, 15, 10, 5, 0]

export default class LandingCountDowns extends React.Component {

	static propTypes = {
		crowdsaleEndAt: PropTypes.object,
		crowdsaleStartAt: PropTypes.object.isRequired
	}

	state = {
		currentBonus: '',
		nextBonus: '',
		bitcoinsRaised: 0, //2000.45
		crowdSaleIsActive: true,
	}

	componentDidMount() {
		const currentBonus = this.calculateCurrentStage()
		this.setState({
			currentBonus,
			nextBonus: currentBonus != 0 ? currentBonus - 5 : 0
		})
	}

	addDays = days => {
		const result = new Date(this.props.crowdsaleStartAt)
		result.setDate(result.getDate() + days)
		return result
	}

	// dates are calculated based on props.crowdsaleStartAt variable
	dates = [
		{ date: this.addDays(15), bonus: 25 },
		{ date: this.addDays(18), bonus: 20 },
		{ date: this.addDays(21), bonus: 15 },
		{ date: this.addDays(24), bonus: 10 },
		{ date: this.addDays(27), bonus: 5 },
		{ date: this.addDays(18), bonus: 0 }
	]

	calculateCurrentStage = () => {
		const {crowdsaleStartAt} = this.props

		if (crowdsaleStartAt < this.addDays(15)) return stages[0]
		else if (crowdsaleStartAt < this.addDays(18)) return stages[1]
		else if (crowdsaleStartAt < this.addDays(21)) return stages[2]
		else if (crowdsaleStartAt < this.addDays(24)) return stages[3]
		else if (crowdsaleStartAt < this.addDays(27)) return stages[4]
		return stages[5]
	}

	// TODO add this
	// handleCrowdsaleStart = () => {}
	// handleCrowdsaleEnd = () => {}
	// handleStageChange = () => {}

	render() {
		const {state, props} = this
		const currentStage = this.dates.find((item) => item.bonus == this.calculateCurrentStage())

		return (
			<section className="CountDowns">

				{/* HEADERS */}
				<div className="row text-center CountDowns__headers">
					<div className="small-12 columns">
						<strong className="CountDowns__slogan">Каждый Голос имеет значение!</strong>
						<h1>Децентрализованная социальная сеть для блоггеров и журналистов</h1>
					</div>
				</div>

				{/* COUNTERS */}
				{/* change counter */}
				{
					props.prefill
					? 	<div className="row text-center CountDowns__counters">
							<div className="small-12 medium-6 columns">
								<CountDown title="Продажа силы голоса начнется" date={props.crowdsaleStartAt} />
								{/* TODO добавить второй каундаун к 18:00 1 ноября */}
								{/* TODO текст: "начало продажи силы голоса начнется" */}
							</div>
							<div className="small-12 medium-6 columns">
								<CountDown title="Продажа силы голоса начнется" date={props.crowdsaleStartAt} />
								{/* TODO добавить второй каундаун к 18:00 1 ноября */}
								{/* TODO текст: "запуск блокчейна через" */}
							</div>
						</div>
					: 	<div className="row text-center CountDowns__counters">
							<div className="small-12 medium-4 columns">
								<CountDown title="Продажа силы голоса закончится" date={props.crowdsaleEndAt} />
							</div>
							<div className="small-12 medium-4 columns">
								<p>Собрано биткоинов</p>
								<strong>{state.bitcoinsRaised} B</strong>
								<p>
									<small>Текущий бонус <span className="red"> + {state.currentBonus}%</span></small>
								</p>
							</div>
							<div className="small-12 medium-4 columns">
								<CountDown title={`Бонус уменьшится: до ${state.nextBonus}%`} date={currentStage.date} />
							</div>
						</div>
				}


				{/* BUTTON */}
				{
					props.prefill
					? null
					: <div className="row CountDowns__button">
						<div className="small-12 columns">
							{props.button}
							<small>Продажа Голоса закончиться при достижении 3300 ฿</small>
						</div>
					</div>
				}

				{/* FOOTER LINKS */}
				{
					props.prefill
					? 	<div className="row CountDowns__links">
							<div className="small-12 columns text-center">
								<a href="https://wiki.golos.io/" className="CountDowns__button_small">вики проекта</a>
								<a href="https://www.youtube.com/channel/UCcBPq2gUdpkL9m-_a92AFVQ" className="CountDowns__button_small">youtube</a>
								<a href="https://github.com/goloschain" className="CountDowns__button_small">github</a>
							</div>
						</div>
					: 	<div className="row CountDowns__links">
							<div className="small-12 medium-6 columns text-left">
								<a href="https://wiki.golos.io/1-introduction/golos_whitepaper.html" className="CountDowns__button_small">White Paper</a>
								<a href="https://wiki.golos.io/5-development/roadmap.html" className="CountDowns__button_small">Дорожная карта</a>
							</div>
							<div className="small-12 medium-6 columns text-right CountDowns__social-links">
								<p>Социальные сети: </p>
								<ul>
									<li>
										<a href="facebook.com"><img src="images/landing/fb.jpg" /></a>
									</li>
									<li>
										<a href="twitter.com"><img src="images/landing/tw.jpg" /></a>
									</li>
								</ul>
							</div>
						</div>
				}
				<hr />
			</section>
		)
	}
}
