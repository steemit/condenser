import React from 'react'

export default class LandingBlockchainRevolution extends React.Component {
	render() {
		return (
			<section className="BlockchainRevolution">
				<div className="row text-center">
					<div className="Landing__header small-12 columns">
						<h2>Блокчейн-революция</h2>
						<span className="BlockchainRevolution__supporting-text">Сила Голоса позволяет оценивать опубликованный контент</span>
					</div>
				</div>
				<div className="row">
					<div className="small-6 columns">
						<img src="https://www.steemimg.com/images/2016/08/24/cyberfund92a82.jpg" alt="cyber.fund logo" />
					</div>
					<div className="small-6 columns">
						{/* 10%   	Резерв на развитие
10%   	Распределение держателям Steem
10% 	Cyber.Fund
7%   		Основателям Голоса
3%   		Майнерам Голоса
60% 	Краудсейл */}
					</div>
				</div>
				<div className="row">
					<div className="small-12 columns text-center">
						<a href="" className="button">Узнать больше, что такое Голос</a>
					</div>
				</div>
				<hr />
			</section>
		)
	}
}
