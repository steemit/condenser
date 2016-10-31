import React, { PropTypes } from 'react'
import CountDown from 'app/components/elements/CountDown'
import Icon from 'app/components/elements/Icon'
import {APP_ICON} from 'config/client_config'

const stages = [25, 20, 15, 10, 5, 0]

export default class LandingCountDowns extends React.Component {

	static propTypes = {
		prefill: PropTypes.bool,
		crowdsaleEndAt: PropTypes.object,
		blockchainStartAt: PropTypes.object,
		crowdsaleStartAt: PropTypes.object.isRequired,
	}

	state = {
		currentBonus: '',
		nextBonus: '',
		bitcoinsRaised: 0,
		prefill: this.props.prefill,
		secondsSinceEpoch: Math.round(((new Date()).getTime()) / 1000),
		crowdSaleIsActive: this.props.crowdsaleStartAt > Date.now(),
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

	updateTime = () => {
		this.setState({secondsSinceEpoch: this.state.secondsSinceEpoch + 1})
	}

	componentWillMount() {
		if(process.env.BROWSER) this.updateTime = setInterval(this.updateTime, 1000);
	}

	componentWillUnmount() {
		if(process.env.BROWSER) clearInterval(this.updateTime)
	}

	// TODO add this
	handleCrowdsaleStart = () => (this.setState({prefill: false}))
	// handleCrowdsaleEnd = () => {}
	// handleStageChange = () => {}

	render() {
		const {state, props} = this
		const currentStage = this.dates.find((item) => item.bonus == this.calculateCurrentStage())
		const previousStage = this.dates.find((item) => item.bonus < this.calculateCurrentStage())

		function strSplice(str1, str2, location) {
		  return str1.slice(0, location) + str2 + str1.slice(location, str1.length);
		}

		function addCommas(number) {
		  var returnvalue = number.toString();
		  var length = returnvalue.length;
		  var commas = Math.ceil(length / 3) - 1;
		  for (var i = 1; i <= commas; i++) {
		    returnvalue = strSplice(returnvalue, " ", (length - i * 3));
		  }
		  return returnvalue;
		}

		function calculateBlock(current_time) {
		  return Math.round((current_time - (1476789457)) / 3);
		}

		return (
			<section className="CountDowns" id="CountDowns">
				{/* HEADERS */}
				<div className="CountDowns__headers">
					<div className="row text-center">
						<div className="small-12 columns">
							<strong className="CountDowns__slogan" id="countdown">Каждый ГОЛОС имеет значение!</strong>
							{
								process.env.BROWSER
								? <div className="CountDowns__logo wow fadeInLeft"><Icon name={APP_ICON} size="2x" /></div>
								: null
							}
							<h1 className="CountDowns__headers__h1">Социально-медийная блокчейн платформа</h1>
						</div>
					</div>
				</div>

				{/* COUNTERS */}
				{/* prefill means pre crowdsale start info */}
				<div className="row CountDowns__blocks">
					{/* number of blocks */}
					<div className="small-12 columns">
						<center>
							<p>Текущий блок: {addCommas(calculateBlock(state.secondsSinceEpoch))}</p>
						</center>
					</div>
				</div>
				{
					// state.prefill
					false
					? 	<div className="row text-center CountDowns__counters">
							<CountDown
								date={props.crowdsaleStartAt}
								onEnd={this.handleCrowdsaleStart}
								countFrom={props.crowdsaleStartAt.getTime()}
								title={<strong>До старта продажи Силы Голоса</strong>}
								className="small-12 medium-6 columns CountDowns__counter"
							/>
						</div>
					: 	<div className="row text-center CountDowns__counters">
							<div className="small-12 medium-4 columns CountDowns__counter">
								<CountDown
									title="Продажа силы голоса закончится"
									date={props.crowdsaleEndAt}
									countFrom={props.crowdsaleEndAt.getTime() - props.crowdsaleStartAt.getTime()}
									displayWhenZero
								/>
							</div>
							<div className="small-12 medium-4 columns CountDowns__counter" style={{paddingTop: 40}}>
								<p style={{marginBottom: 0}}>Собрано биткоинов</p>
								<strong>{state.bitcoinsRaised} B</strong>
								<p>
									<small>Текущий бонус <span className="red"> + {state.currentBonus}%</span></small>
								</p>
							</div>
							<div className="small-12 medium-4 columns">
								<CountDown
									title={`Бонус уменьшится: до ${state.nextBonus}%`}
									date={currentStage.date}
									countFrom={previousStage.date.getTime()}
									displayWhenZero
								/>
							</div>
						</div>
				}


				{/* BUTTON */}
				{
					// state.prefill
					false
					? null
					: <div className="row CountDowns__button">
						<div className="small-12 columns">
							{props.button}
							<small>Продажа Голоса закончиться при достижении 5000 ฿</small>
						</div>
					</div>
				}

				{/* FOOTER LINKS */}
				{
					// state.prefill
					false
					? 	<div className="row CountDowns__links">
							<div className="small-12 columns text-center">
								<a href="https://steemit.com/@golos" target="blank" className="CountDowns__button_small">блог</a>
								<a href="https://wiki.golos.io/" target="blank" className="CountDowns__button_small">вики</a>
								<a href="https://www.youtube.com/Golosioru" target="blank" className="CountDowns__button_small">youtube</a>
								<a href="https://github.com/goloschain" target="blank" className="CountDowns__button_small">github</a>
							</div>
						</div>
					: 	<div className="row CountDowns__links">
							<div className="small-12 medium-6 columns text-left">
								<a href="https://wiki.golos.io/1-introduction/golos_whitepaper.html" target="blank" className="CountDowns__button_small">White Paper</a>
								<a href="https://wiki.golos.io/5-development/roadmap.html" target="blank" className="CountDowns__button_small">Дорожная карта</a>
							</div>
							<div className="small-12 medium-6 columns text-right CountDowns__social-links">
								<p>Социальные сети: </p>
								<ul>
									<li>
										<a href="facebook.com" target="blank"><img src="images/landing/fb.jpg" /></a>
									</li>
									<li>
										<a href="https://twitter.com/goloschain" target="blank"><img src="images/landing/tw.jpg" /></a>
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
