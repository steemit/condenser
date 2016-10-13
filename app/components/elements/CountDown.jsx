import React, { PropTypes } from 'react'
import { Circle } from 'rc-progress';

// TODO add comment
// TODO add function descriptions

export default class CountDown extends React.Component {

	static propTypes = {
		title: PropTypes.node,
		onEnd: PropTypes.func,
		date: PropTypes.object.isRequired,
		countFrom: PropTypes.object.isRequired
	}

	state = { timeLeft: this.props.date }

	// start timer on mount
	// do not start timer while server-rendering to avoid errors
	componentDidMount() { if (process.env.BROWSER) this.countDown() }
	// && clear timer on unmount
	componentWillUnmount() { if (this.interval) clearInterval(this.interval) }

	getDaysCount = (date = this.props.countFrom) => {
		// how to get number of days
		const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
		const firstDate = new Date()
		const diffDays = Math.round(Math.abs((date - firstDate.getTime())/(oneDay))); // date.getTime()
		return diffDays
	}

	countDown() {
		this.interval = setInterval(() => {
			this.setState({ timeLeft: new Date(this.state.timeLeft.getTime() - 1000) })
		}, 1000)
	}

	render() {
		if (!this.props.date && !this.state.timeLeft) return null
		// get values to display
		const { timeLeft } = this.state
		const days = this.getDaysCount(timeLeft)
		const hours = 	timeLeft.getHours()
		const minutes =	timeLeft.getMinutes()
		const seconds = timeLeft.getSeconds()

		if(timeLeft < 0) {
			this.props.onEnd()
			return <div>done</div>
		}

		function renderCounter(valueInSeconds, description, percentageOf = 60) {

			const percent = 100 - (percentageOf !== 60 ? (valueInSeconds / percentageOf) : (percentageOf - valueInSeconds / percentageOf)) * 100

			return 	<div className="left CountDown__single">
						<div className="CountDown__value">{valueInSeconds}</div>
						<Circle className="CountDown__circle" percent={percent} strokeWidth="3" strokeColor="#d21010" />
						<span className="CountDown__description">{description}</span>
					</div>
		}

		return 	<section className="CountDown">
					<p className="CountDown__title">{this.props.title}</p>
					{renderCounter(days, 'Дни', this.getDaysCount())}
					{renderCounter(hours, 'Часы', 24)}
					{renderCounter(minutes, 'Минуты', 60)}
					{renderCounter(seconds, 'Секунды', 60)}
				</section>
	}
}
