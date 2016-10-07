import React from 'react'

const listInfo = [
		['60%', 'd80a15', 'краудсейл'],
		['10%', '2e17b8', 'резерв на развитие'],
		['10%', 'f9ca0f', 'держателям Steem'],
		['10%', '1e193b', 'cyber•Fund'],
		['7%', 'cd591a', 'основателям Голоса'],
		['3%', '7bd915', 'майнерам Голоса']
]

export default class LandingDistribution extends React.Component {
	render() {
		function renderDot(color) {
			return <span className="Distribution__dot" style={{ backgroundColor: '#' + color }} />
		}

		// NOTE 1: keep this code here incase of rework
		// NOTE 2: use table tags instead of list for easier aligment
		/* const listInfo = [
				['10%', '2e17b8', 'Резерв на развитие'],
				['10%', 'f9ca0f', 'Распределение держателям Steem'],
				['10%', '1e193b', 'Cyber.Fund'],
				[' 7%', 'cd591a', 'Основателям Голоса'],
				[' 3%', '7bd915', 'Майнерам Голоса'],
				['60%', 'd80a15', 'Краудсейл']
		] */
		// function renderList() {
		// 	return	listInfo.map(
		// 				(item) 	=> 	<li className="Distribution__item">
		// 								<strong className="Distribution__strong">{item[0]}</strong>
		// 								<span className="Distribution__dot" style={{ backgroundColor: '#' + item[1] }} />
		// 								{item[2]}
		// 							</li>
		// 				)
		// }

		return (
			<section className="Distribution">
				<div className="row text-center Distribution__headers">
					<div className="small-12 columns">
						<h2 className="Landing__h2_blue">Распределение Силы Голоса</h2>
						<span className="Distribution__supporting-text">Сила Голоса позволяет оценивать опубликованный контент</span>
					</div>
				</div>
				<div className="row">
					<div className="small-6">
						<img src="images/landing/pie.png" />
					</div>
					<div className="small-6 columns Distribution__list">
						<ul>
							{/* {renderList()} */}
							<li className="Distribution__item">
								<strong className="Distribution__strong">60%</strong>
								{renderDot('d80a15')}
								Краудсейл
							</li>
							<li className="Distribution__item">
								<strong className="Distribution__strong">10%</strong>
								{renderDot('2e17b8')}
								Резерв на развитие
							</li>
							<li className="Distribution__item">
								<strong className="Distribution__strong">10%</strong>
								{renderDot('f9ca0f')}
								Держателям Steem
							</li>
							<li className="Distribution__item">
								<strong className="Distribution__strong">10%</strong>
								{renderDot('1e193b')}
								Cyber.Fund
							</li>
							<li className="Distribution__item">
								<strong className="Distribution__strong Distribution__strong_extra-margin">7%</strong>
								{renderDot('cd591a')}
								Основателям Голоса
							</li>
							<li className="Distribution__item">
								<strong className="Distribution__strong Distribution__strong_extra-margin">3%</strong>
								{renderDot('7bd915')}
								Делегатам Голоса
							</li>
							<li className="Distribution__item">
								<strong className="Distribution__strong Distribution__strong_extra-margin">3%</strong>
								{renderDot('7bd915')}
								Банти авторам на время краудсейла
							</li>
						</ul>
					</div>
				</div>
				<div className="row Distribution__action">
					<div className="small-12 columns text-center">
						<a href="" className="button">Узнать больше что такое Голос</a>
					</div>
				</div>
				<hr />
			</section>
		)
	}
}
