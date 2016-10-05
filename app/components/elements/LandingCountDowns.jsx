import React from 'react'
import CountDown from 'app/components/elements/CountDown'
// import ReactCountdownClock from 'react-countdown-clock'


// import 'app/assets/lib/slick-countdown/css/jquery.classycountdown.css'
// // import 'app/assets/lib/slick-countdown/js/jquery.knob.js'
// // import 'app/assets/lib/slick-countdown/js/jquery.throttle.js'
// import 'app/assets/lib/slick-countdown/js/jquery.classycountdown.js'






/*
Как должна работать функция каунтдауна:

день и часы - это округленное оставшееся время, или просто Число.getDayNumber + Число.getNumber

(нужно создать отдельный компонент для чистоты эксперимента)
 */


// how to get number of days
// var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
// var firstDate = new Date(2008,01,12);
// var secondDate = new Date(2008,01,22);
//
// var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));





// Приоритеты(от высшего к низшему)
// запустить нормальные каунтдауны как в псд
// прикрутить к какнтдаунам правильные даты
// прикрутить переход между датами и окончание краудсейла
// закончить с элемент <Team />

// нужно определиться когда будут начаты краудсейлы (кстати переспроси у Кости)
// прогнать краудсейлы сквозь Date object
//
// const bonuses = ['25%', '20%']
//

// как проходит смена дат и каунтдауна
// 1) к каунтдауну прикручивается коллбэк, который запускается когда каунтдаун закончен
// 2) если краудсейл еще активен, то:
// 		а) выставляются новый и следующий бонус
// 		б) выбирается следующая дата и запускается новый каунтдаун


// const crodwsaleStart = new Date(2016, 10, 15); //, hours, minutes, seconds, milliseconds
// format date till start properly
// function createDate(month, day) {
// 	const today = new Date()
// 	const date = new Date(2016, month, day, today.getHours(), today.getMinutes(), today.getSeconds())
// 	// hours, minutes and seconds always start with
// 	// date.setHours(today.getHours())
// 	// date.setMinutes(today.getMinutes())
// 	// date.setSeconds(today.getSeconds())
// 	return date
// }
//
// const tilCrowdsaleStart = createDate(9, 16)

// 1. Допустим мы данный сайт начнем публиковать открыто с момента ICO тогда скидка:
// 25% в первые 15 дней
// 20% с 16 дня по 18 день
// 15% с 19 дня по 21 день
// 10% с 22 дня по 24 день
// 5% с 25 дня по 27 день
// 0% с 28 дня по 30 день

export default class LandingCountDowns extends React.Component {

	state = {
		currentBonus: '25%', // calculateBonus()
		crowdSaleIsActive: true,
		currentStage: null,
		// prefill: this.props.crowdSaleIsActive < Date.now()
	}

	render() {
		console.log(this.props.crowdSaleIsActive < Date.now())
		console.log('this.props.prefill', this.props.prefill)
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
					this.props.prefill
					? 	<div className="row text-center CountDowns__counters">
							<div className="small-12 columns">
								<CountDown title="Продажа силы голоса начнется" date={this.props.crowdsaleStartAt} />
							</div>
						</div>
					: 	<div className="row text-center CountDowns__counters">
							<div className="small-12 medium-6 columns">
								<CountDown title="Продажа силы голоса закончится" date={this.props.crowdsaleStartAt} />
							</div>
							<div className="small-12 medium-6 columns">
								<CountDown title="Бонус уменьшится: до 20%" date={this.state.currentStage} />
							</div>
						</div>
				}


				{/* BUTTON */}
				{
					this.props.prefill
					? null
					: <div className="row CountDowns__button">
						<div className="small-12 columns">
							{this.props.button}
							<small>Продажа Голоса закончиться при достижении 3300 ฿</small>
						</div>
					</div>
				}

				{/* FOOTER LINKS */}
				{
					this.props.prefill
					? 	<div className="row CountDowns__links">
							<div className="small-12 columns text-center">
								<a href="#" className="CountDowns__button_small">я не помню какие-ссылки сюда вставлять</a>
								<a href="#" className="CountDowns__button_small">напишите мне в wire если забуду это исправить</a>
							</div>
						</div>
					: 	<div className="row CountDowns__links">
							<div className="small-12 medium-6 columns text-left">
								<a href="#" className="CountDowns__button_small">White Paper</a>
								<a href="#" className="CountDowns__button_small">Дорожная карта проекта</a>
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
