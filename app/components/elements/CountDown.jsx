import React, { PropTypes } from 'react'
import { Circle } from 'rc-progress';
import { FIRST_DATE as firstDate } from 'config/client_config'
// TODO add comment
// TODO add function descriptions
const _ms_in_day = 1000*60*60*24;
export default class CountDown extends React.Component {

	static propTypes = {
		title: PropTypes.node,
		onEnd: PropTypes.func,
		date: PropTypes.object.isRequired,
	}

	componentWillMount() {
		this.setState ({ timeLeft: this.props.date.getTime() - Date.now() })
  }


	// start timer on mount
	// do not start timer while server-rendering to avoid errors
	componentDidMount() { if (process.env.BROWSER) this.countDown() }
	// && clear timer on unmount
	componentWillUnmount() { if (this.interval) clearInterval(this.interval) }

	getDaysCount() {

		const currentDate = Date.now();
		const lastDate = this.props.date;

		const spanDays = (lastDate.getTime() - firstDate.getTime())/_ms_in_day;
	  const diffDays = (currentDate - firstDate.getTime())/_ms_in_day; //
		return diffDays/spanDays;
	}

	countDown() {
		this.interval = setInterval(() => {
			this.setState({ timeLeft: this.props.date.getTime() - Date.now() })
		}, 1000)
	}

	render() {
		if (!this.props.date) return null
		// get values to display
		if (!this.state.timeLeft)
			this.setState({ timeLeft: this.props.date.getTime() - Date.now() })
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
					{renderCounter(h, 'Часы', 24)}
					{renderCounter(m, 'Минуты', 60)}
					{renderCounter(s, 'Секунды', 60)}
				</section>
	}
}
