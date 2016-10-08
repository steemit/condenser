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
						<a href="https://cyber.fund/" target="blank">
							<img src="images/landing/cyberfund.png" alt="логотип Киберфонда" />
						</a>
					</div>
					<div className="small-12 medium-6 columns">
						<a href="https://steemit.com/" target="blank">
							<img src="https://www.steemimg.com/images/2016/07/20/steemad9f2.jpg" alt="логотип Steemit" />
						</a>
					</div>
				</div>
				<div className="row WhoWeAre__texts">
					<div className="small-12 columns">
						<p>Голос по лицензии Стимит инк, одна из лучших команд в области блокчейн, описать результаты - капитализацию, рост как у Фейсбука</p>
						{/* <span>Голос по лицензии Стимит инк, одна из лучших команд в области блокчейн, описать результаты - капитализацию, рост как у Фейсбука и т.д.</span> */}
					</div>
				</div>
				<hr />
			</section>
		)
	}
}
