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
				<div className="row text-center Partners__logos align-center align-middle">
					<div className="small-6 medium-3 columns">
						<a href="https://explorer.golos.io/" target="blank">
							<img src="images/landing/l7.jpg" alt="Golos Explorer" />
						</a>
					</div>
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
  				<div className="small-6 medium-3 columns">
						<a href="http://steepshot.io/" target="blank">
							<img src="images/landing/l8.jpg" alt="Steepshot" />
						</a>
					</div>
  				<div className="small-6 medium-3 columns">
						<a href="https://goldvoice.club/" target="blank">
							<img src="images/landing/l9.jpg" alt="GoldVoice" />
						</a>
					</div>
  				<div className="small-6 medium-3 columns">
						<a href="https://oneplace.media/g" target="blank">
							<img src="images/landing/l11.jpg" alt="OnePlace" />
						</a>
					</div>
  				<div className="small-6 medium-3 columns">
						<a href="https://golos.today/" target="blank">
							<img src="images/landing/l16.jpg" alt="Golos Today" />
						</a>
					</div>
  				<div className="small-6 medium-3 columns">
						<a href="https://cpeda.space/" target="blank">
							<img src="images/landing/l12.jpg" alt="CPEDA.SPACE" />
						</a>
					</div>
				</div>
				<hr />
			</section>
		)
	}
}
