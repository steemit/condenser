import React from 'react'
import { Line, Circle } from 'rc-progress';


/*
Как должна работать функция каунтдауна:

день и часы - это округленное оставшееся время, или просто Число.getDayNumber + Число.getNumber

(нужно создать отдельный компонент для чистоты эксперимента)
 */




// format date till start properly
let tilCrowdsaleStart = new Date(2016, 9, 16, 0, 0)
const today = new Date()
tilCrowdsaleStart.setHours(today.getHours())
tilCrowdsaleStart.setMinutes(today.getMinutes())
tilCrowdsaleStart.setSeconds(today.getSeconds())

function getDaysCount(date = tilCrowdsaleStart) {
	// how to get number of days
	const oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
	const firstDate = new Date()
	const diffDays = Math.round(Math.abs((date.getTime() - firstDate.getTime())/(oneDay)));
	return diffDays
}
// 1. Допустим мы данный сайт начнем публиковать открыто с момента ICO тогда скидка:
// 25% в первые 15 дней
// 20% с 16 дня по 18 день
// 15% с 19 дня по 21 день
// 10% с 22 дня по 24 день
// 5% с 25 дня по 27 день
// 0% с 28 дня по 30 день

export default class CountDown extends React.Component {

	state = {
		timeLeft: tilCrowdsaleStart
		// crowdSaleIsActive: false,
		// currentBonus: '25%', // calculateBonus()
		// bitcoinsRaised: 1999,
		// nextBonus: '20%' // calculateNextBonus // Бонус уменьшится: до 20%
	}


	componentDidMount() {
		// this.startCountDown()
		// startCountDown = () => {
			setInterval(() => {
				this.setState({ timeLeft: new Date(this.state.timeLeft.getTime() - 1000) })
			}, 1000);
		// }
	}

	render() {
		// get values to display
		const { timeLeft } = this.state
		const days = getDaysCount(this.state.timeLeft)
		const hours = timeLeft.getHours()
		const minutes =	timeLeft.getMinutes()
		const seconds = timeLeft.getSeconds()

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
					{renderCounter(days, 'Дни', getDaysCount())}
					{renderCounter(hours, 'Часы', 24)}
					{renderCounter(minutes, 'Минуты', 60)}
					{renderCounter(seconds, 'Секунды', 60)}
				</section>
	}
}
