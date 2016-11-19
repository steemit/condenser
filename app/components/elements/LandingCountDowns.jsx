import React, { PropTypes } from 'react'
import CountDown from 'app/components/elements/CountDown'
import Icon from 'app/components/elements/Icon'
import {APP_ICON} from 'config/client_config'
import 'whatwg-fetch';
import icoDestinationAddress from 'shared/icoAddress'
import { FormattedMessage } from 'react-intl';
import { translate } from 'app/Translator';
// import { crowdsaleStartAt } from '../pages/Landing'

const satoshiPerCoin = 100000000
// format date properly
function createDate(year, month, day, hours, minutes) {
	//const today = new Date()
	//const mins = (minutes == 0 || !minutes) ? 0 : today.getMinutes()
	const date = new Date(Date.UTC(year, month, day, hours || 0, minutes || 0, 0));
	return date
}

export const blockchainStartAt 	= createDate(2016, 9, 18, 11, 0)
export const crowdsaleStartAt 	= createDate(2016, 10, 1, 11, 0)
export const crowdsaleEndAt 	= createDate(2016, 11, 4, 11, 0)

const stages = [25, 20, 15, 10, 5, 0]
export function calculateCurrentStage(date = Date.now()) {
	if (date < addDays(15).getTime()) return stages[0]
  else if (date < addDays(18).getTime()) return stages[1]
  else if (date < addDays(21).getTime()) return stages[2]
  else if (date < addDays(24).getTime()) return stages[3]
  else if (date < addDays(27).getTime()) return stages[4]
	return stages[5]
}

export function addDays(days) {
	const result = new Date(crowdsaleStartAt)
	result.setDate(result.getDate() + days)
	return result
}
// crowdsaleDates are calculated based on props.crowdsaleStartAt variable
export const crowdsaleDates = [
		{ date: addDays(15), bonus: 25 },
		{ date: addDays(18), bonus: 20 },
		{ date: addDays(21), bonus: 15 },
		{ date: addDays(24), bonus: 10 },
		{ date: addDays(27), bonus: 5 },
		{ date: addDays(33), bonus: 0 }
	]
export const currentStage = crowdsaleDates.find((item) => item.bonus == calculateCurrentStage())

export default class LandingCountDowns extends React.Component {

	static propTypes = {
		prefill: PropTypes.bool,
		crowdsaleEndAt: PropTypes.object,
		blockchainStartAt: PropTypes.object,
		crowdsaleStartAt: PropTypes.object.isRequired,
	}

	state = {
		nextBonus: '',
		currentBonus: '',
		bitcoinsRaised: false,
		bitcoinsRaisedIncludingUnconfirmed: false,
		unconfirmedNTx: false,
		prefill: this.props.prefill,
		secondsSinceEpoch: Math.round(((new Date()).getTime()) / 1000),
		crowdSaleIsActive: this.props.crowdsaleStartAt > Date.now(),
		showBitcoinsRaised: true
	}

	componentDidMount() {
		const currentBonus = calculateCurrentStage()
		this.setState({
			currentBonus,
			nextBonus: currentBonus != 0 ? currentBonus - 5 : 0
		})
	}

	updateTime = () => {
		this.setState({secondsSinceEpoch: this.state.secondsSinceEpoch + 1})
	}

	fetchRaized() {
		fetch(`https://api.blockcypher.com/v1/btc/main/addrs/${icoDestinationAddress}/balance`, {
			})
		.then((resp) => {
			console.log(resp)
		  let json = resp.json();
		  if (resp.status >= 200 && resp.status < 300) {
		    return json;
		  } else {
		    return json.then(Promise.reject.bind(Promise));
		  }
		})
		.then(object => {
			const raised = object.balance;
			const raisedWithUnconfirmed = object.final_balance
			console.log('object', object)
			this.setState({
				bitcoinsRaised: raised, // [please apply formatters instead]
				bitcoinsRaisedIncludingUnconfirmed: raisedWithUnconfirmed,
				unconfirmedNTx: object.unconfirmed_n_tx || 0
			})
		})
		.catch(error => {
			this.setState({
				bitcoinsRaised: 0,
				showBitcoinsRaised: false,
			})
			try {
				console.error('fetching raized error ', error);
				console.error('fetching raized error ', error.reason);
			} catch (e) {}
		});
	}

	componentWillMount() {
		if(process.env.BROWSER) this.updateTime = setInterval(this.updateTime, 1000);
		// fetch raised btc
		if(process.env.BROWSER) this.fetchRaized()
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
		const currentStage = crowdsaleDates.find((item) => item.bonus == calculateCurrentStage())
		const previousStage = crowdsaleDates.find((item) => item.bonus < calculateCurrentStage())
    const nextStage = calculateCurrentStage() ? calculateCurrentStage() - 5 : 0

    let {bitcoinsRaised} = state
    bitcoinsRaised = String(bitcoinsRaised)
    bitcoinsRaised = bitcoinsRaised.split('')
    bitcoinsRaised.splice(-8, 0, '.');
    bitcoinsRaised = bitcoinsRaised.join('')
    bitcoinsRaised = Number(bitcoinsRaised)

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
					state.prefill
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
								{
									state.showBitcoinsRaised
									? <div>
										<p style={{marginBottom: 0}}>Собрано биткоинов</p>
										{
											state.bitcoinsRaised === false
											? <strong>загрузка...</strong>
											: <strong><a href="https://blockchain.info/address/3CWicRKHQqcj1N6fT1pC9J3hUzHw1KyPv3" target="blank">{bitcoinsRaised.toPrecision(7)} B</a></strong>
										}
									</div>
									: null
								}
								{
									state.bitcoinsRaised !== state.bitcoinsRaisedIncludingUnconfirmed
									? <span style={{display: 'block'}}>({state.bitcoinsRaisedIncludingUnconfirmed.toPrecision(7)} включая{' '}
									<FormattedMessage id="unverified_transactions" values={{transactionsCount: state.unconfirmedNTx}} />)</span> : null
									// {translate('unverified_transactions', {transactionsCount: state.unconfirmedNTx})}
								}

								<p>
									<small>Текущий бонус <span className="red"> + {calculateCurrentStage()}%</span></small>
								</p>
							</div>
							<div className="small-12 medium-4 columns">
								<CountDown
                  title={`Бонус уменьшится: до ${nextStage}%`}
									date={currentStage.date}
									countFrom={previousStage.date.getTime()}
									displayWhenZero
								/>
							</div>
						</div>
				}


				{/* BUTTON */}
				{
					state.prefill
					? null
					: <div className="row CountDowns__button">
						<div className="small-12 columns">
							{props.button}
							<small>Продажа Голоса закончится при достижении 5000 ฿</small>
						</div>
					</div>
				}

				{/* FOOTER LINKS */}
				{
					state.prefill
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
								<a href="https://golos.io/ru--golos/@golos/golos-russkoyazychnaya-socialno-mediinaya-blokchein-platforma" target="blank" className="CountDowns__button_small">White Paper</a>
								<a href="https://wiki.golos.io/5-development/roadmap.html" target="blank" className="CountDowns__button_small">Дорожная карта</a>
							</div>
							<div className="small-12 medium-6 columns text-right CountDowns__social-links">
								<p>Социальные сети: </p>
								<ul>
									<li>
										<a href="https://www.facebook.com/golosru" target="blank"><img src="images/landing/fb.jpg" /></a>
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
