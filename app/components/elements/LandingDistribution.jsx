import React from 'react'

export default class LandingDistribution extends React.Component {
	render() {
		return (
			<section className="Distribution">
				<div className="row text-center">
					<div className="Landing__header small-12 columns WhatIsGolos__header">
						<h2>Распределение Силы Голоса</h2>
						<span className="Landing__header">Сила Голоса позволяет оценивать опубликованный контент</span>
					</div>
				</div>
				<div className="row">
					<div className="small-12 medium-6 large-centered columns columns WhatIsGolos__video">
						<div className="flex-video">
							<iframe width="420" height="315" src="//www.youtube.com/embed/aiBt44rrslw" frameBorder="0" allowFullScreen />
						</div>
					</div>
				</div>
				<div className="row">
					<div className="small-12 columns text-center">
						<a href="" className="button">Узнать больше что такое Голос</a>
					</div>
				</div>
				<hr />
			</section>
		)
	}
}
