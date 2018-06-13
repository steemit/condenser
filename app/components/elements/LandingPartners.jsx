import React from 'react'

export default class LandingPress extends React.Component {
	render() {
		return (
			<section className="Partners">
				<div className="row text-center">
					<div className="small-12 columns">
						<h2 id="partners">Партнеры</h2>
					</div>
				</div>
				<div className="row text-center Partners__logos">
					<div className="small-6 medium-3 columns">
						<a href="https://kuna.com.ua/" target="blank">
							<img className="Partners__kuna-logo" src="images/landing/kuna.png" alt="Kuna" />
						</a>
					</div>
  					<div className="small-6 medium-3 columns">
						<a href="https://forklog.com/" target="blank">
							<img className="Partners__forklog-logo" src="images/landing/forklog-logo.svg" alt="Forklog" />
						</a>
					</div>
				</div>
			</section>
		)
	}
}
