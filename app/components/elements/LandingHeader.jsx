import React from 'react'

export default class LandingHeader extends React.Component {

	render() {
		return (
			<section className="LandingHeader">
				<div className="row">
					<div className="small-2 columns">
						<a href="/about" className="LandingHeader__logo" id="header">
							<img src="images/landing/golos.png" />
						</a>
					</div>
					<div className="small-10 columns">
						<ul className="LandingHeader__menu">
							<li className="LandingHeader__menu__li">
								<a href="#what-is-golos">Видео</a>
							</li>
							<li className="LandingHeader__menu__li">
								<a href="#docs">Документация</a>
							</li>
							<li className="LandingHeader__menu__li">
								<a href="#faq">FAQ</a>
							</li>
							<li className="LandingHeader__menu__li">
								<a href="#team">Команда</a>
							</li>
							<li className="LandingHeader__menu__li">
								<a href="/login.html">
									<img src="images/user.png" />
									Тестовый Вход
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
