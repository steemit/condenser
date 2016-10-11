import React from 'react'

export default class LandingHeader extends React.Component {

	render() {
		return (
			<section className="LandingHeader">
				<div className="row">
					<div className="small-2 columns">
						<a href="/" className="LandingHeader__logo" id="header">
							<img src="images/landing/golos.png" />
						</a>
					</div>
					<div className="small-10 columns">
						<ul className="LandingHeader__menu">
							<li className="LandingHeader__menu__li">
								<a href="/ico">Видео</a>
							</li>
							<li className="LandingHeader__menu__li">
								<a href="#docs">Документация</a>
							</li>
							<li className="LandingHeader__menu__li">
								<a href="">FAQ</a>
							</li>
							<li className="LandingHeader__menu__li">
								<a href="">Команда</a>
							</li>
							<li className="LandingHeader__menu__li">
								<a href="">
									<img src="images/user.png" />
									Вход
								</a>
							</li>
						</ul>
					</div>
					<div style={{clear: 'both'}}></div>
				</div>
			</section>
		)
	}
}
