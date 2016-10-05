import React from 'react'

export default class LandingDistribution extends React.Component {
	render() {
		return (
			<section className="Distribution">
				<div className="row text-center">
					<div className="small-12 columns WhatIsGolos__header">
						<h2 className="Landing__h2_blue">Распределение Силы Голоса</h2>
						<span>Сила Голоса позволяет оценивать опубликованный контент</span>
					</div>
				</div>
				<div className="row">
					<div className="small-6">
						<img src="images/landing/pie.png" />
					</div>
					<div className="small-6">
						<div className="small-6 columns">
							<ul>
								<li>10%   	Резерв на развитие</li>
								<li>10%   	Распределение держателям Steem</li>
								<li>10% 	Cyber.Fund</li>
								<li>7%   	Основателям Голоса</li>
								<li>3%   	Майнерам Голоса</li>
								<li>60% 	Краудсейл</li>
							</ul>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="small-12 columns text-center">
						<a href="" className="button secondary">Узнать больше что такое Голос</a>
					</div>
				</div>
				<hr />
			</section>
		)
	}
}
