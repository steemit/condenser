import React from 'react'

export default class LandingWhatIsGolos extends React.Component {
	render() {
		return (
			<section className="WhatIsGolos">
				<div className="row text-center">
					<div className="   small-12 columns WhatIsGolos__header">
						<h2>Что такое Голос?</h2>
						<span className="  ">Децентрализованная социальная сеть для блоггеров и журналистов</span>
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
						<a href="" className="button"> Купи Силу Голоса </a>
					</div>
				</div>
				<hr />
			</section>
		)
	}
}
