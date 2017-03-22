import React, { PropTypes } from 'react'
// import { Circle } from 'rc-progress';
import { FIRST_DATE as firstDate } from 'config/client_config'
// TODO add comment
// TODO add function descriptions
const _ms_in_day = 1000*60*60*24;
export default class CountDown extends React.Component {

	static propTypes = {
		title: PropTypes.node,
		onEnd: PropTypes.func,
		displayWhenZero: PropTypes.bool,
		date: PropTypes.object.isRequired,
	}

	state = {
		timeLeft: this.props.date ? this.props.date.getTime() - Date.now() : 0
	}
	// start timer on mount
	// do not start timer while server-rendering to avoid errors
	componentDidMount() { if (process.env.BROWSER) this.startCountDown() }

	// && clear timer on unmount
	componentWillUnmount() {
		if (process.env.BROWSER) this.clearInterval()
	}

	// use extra method to clear interval because it will be called from various places,
	// and refactoring will likely to brake something if used otherwise
	clearInterval = () => { if (this.interval) clearInterval(this.interval)}

	getDaysCount() {

		const currentDate = Date.now();
		const lastDate = this.props.date;

		const spanDays = (lastDate.getTime() - firstDate.getTime())/_ms_in_day;
		const diffDays = (currentDate - firstDate.getTime())/_ms_in_day; //
		return diffDays/spanDays;
	}

	startCountDown() {
		this.interval = setInterval(() => {
			this.setState({ timeLeft: this.props.date.getTime() - Date.now() })
		}, 1000)
	}

	render() {
		const {date, onEnd, displayWhenZero} = this.props
		if (!date) return null
		// if (!this.state.timeLeft)
		// this.setState({ timeLeft: this.props.date.getTime() - Date.now() })

		// get values to display
		const { timeLeft } = this.state
		const seconds = (timeLeft-timeLeft%1000)/1000;
		const minutes = (seconds - seconds%60)/60;
		const hours = (minutes - minutes%60)/60;
		const days = (hours - hours%24)/24;
		const s = seconds%60;
 		const m = minutes%60;
		const h = hours%24;
		const d = days;

		if(timeLeft < 0) {
			console.log('timeLeft < 0!!!')
			// make callback if provided
			if (onEnd) onEnd()
			// stop countdown
			this.clearInterval()
			// hide component unless 'displayWhenZero' is specified
			if(!displayWhenZero) return null
		}

		function renderCounter(valueInSeconds, description, percentageOf = 60) {

			const percent = 100 - (percentageOf !== 60 ? (valueInSeconds / percentageOf) : (percentageOf - valueInSeconds / percentageOf)) * 100

			return 	<div className="left CountDown__single">
						<div className="CountDown__value">{valueInSeconds}</div>
						{/* <Circle className="CountDown__circle" percent={percent} strokeWidth="3" strokeColor="#d21010" /> */}
						<span className="CountDown__description">{description}</span>
					</div>
		}

		return 	<section className={"CountDown " + this.props.className}>
					<p className="CountDown__title">{this.props.title}</p>
					{renderCounter(days, 'Дни', this.getDaysCount())}
					{renderCounter(h, 'Часы', 24)}
					{renderCounter(m, 'Минуты', 60)}
					{renderCounter(s, 'Секунды', 60)}
				</section>
	}
}
