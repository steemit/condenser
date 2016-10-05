import React from 'react'

export default class LandingWhoWeAre extends React.Component {
	render() {
		return (
			<section className="WhoWeAre">
				<div className="row text-center WhoWeAre__headers">
					<div className="small-12 columns">
						<h2 className="Landing__h2_blue">Кто мы?</h2>
						<span>Децентрализованная социальная сеть для блоггеров и журналистов</span>
					</div>
				</div>
				<div className="row WhoWeAre__images">
					<div className="small-12 medium-6 columns">
						<img src="images/landing/cyberfund.png" alt="логотип Киберфонда" />
					</div>
					<div className="small-12 medium-6 columns">
						<img src="images/landing/steem.png" alt="логотип Steemsit" />
					</div>
				</div>
				<div className="row WhoWeAre__texts">
					<div className="small-12 columns">
						<p>Голос по лицензии Стимит инк, одна из лучших команд в области блокчейн, описать результаты - капитализацию, рост как у Фейсбука</p>
						<span>Голос по лицензии Стимит инк, одна из лучших команд в области блокчейн, описать результаты - капитализацию, рост как у Фейсбука и т.д.</span>
					</div>
				</div>
				<hr />
			</section>
		)
	}
}
