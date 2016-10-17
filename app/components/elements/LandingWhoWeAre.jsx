import React from 'react'

export default class LandingWhoWeAre extends React.Component {
	render() {
		return (
			<section className="WhoWeAre">
				<div className="row text-center WhoWeAre__headers">
					<div className="small-12 columns">
						<h2 className="blue" id="who-we-are">Кто мы?</h2>
						<span>Децентрализованная социальная сеть для блоггеров и журналистов</span>
					</div>
				</div>
				<div className="row WhoWeAre__images">
					<div className="small-12 medium-6 columns">
						<a href="https://cyber.fund/" target="blank">
							<img src="https://cyber.fund/images/cybF.svg" alt="логотип Киберфонда" />
						</a>
					</div>
					<div className="small-12 medium-6 columns">
						<a href="https://steemit.com/" target="blank">
							<img src="/images/landing/steemit-logo.svg" alt="логотип Steemit" />
						</a>
					</div>
				</div>
				<div className="row WhoWeAre__texts">
					<div className="small-12 columns">
						<p>Голос создан командой cyber•Fund по лицензии Steemit Inc.</p>
					</div>
				</div>
				<hr />
			</section>
		)
	}
}
