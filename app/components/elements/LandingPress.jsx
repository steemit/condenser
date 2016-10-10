import React from 'react'

export default class LandingPress extends React.Component {
	render() {
		return (
			<section className="Press">
				<div className="row">
					<div className="small-12 columns">
						<h2 className="Press__header Landing__h2_blue">Пресса</h2>
					</div>
				</div>
				<div className="row">
					<div className="small-12 columns">
						<img src="https://www.cryptocoinsnews.com/wp-content/uploads/2016/01/Russian-flag-in-silk-768x506.jpg" />
						<a href="https://www.cryptocoinsnews.com/new-blockchain-social-media-platform-speaks-with-a-russian-voice/">New Blockchain Social Media Platform Speaks with a Russian 'Voice'</a>
					</div>
				</div>
				{/* Костя сказал убрать логотипы и вставить ссылки на статьи */}
				{/* <div className="row Press__logos">
					<div className="small-4 medium-3 large-2">
						<img src="https://cyber.fund/images/cybF.svg" alt="логотип cyber.fund" />
					</div>
					<div className="small-4 medium-3 large-2">
						<img src="images/landing/steem.png" alt="логотип steem" />
					</div>
				</div> */}
				{/* Дима сказал убрать кнопку */}
				{/*
				<div className="row Press__action">
					<div className="small-12 columns">
						{this.props.button}
						<p className="Press__action__p">Продажа Голоса закончиться при достижении 3300 ฿</p>
					</div>
				</div>
				*/}
				<hr />
			</section>
		)
	}
}
