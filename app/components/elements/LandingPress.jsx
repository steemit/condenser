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
				<div className="row Press__logos">
					<div className="small-4 medium-3 large-2">
						<img src="images/landing/cyberfund.png" alt="логотип cyber.fund" />
					</div>
					<div className="small-4 medium-3 large-2">
						<img src="images/landing/steem.png" alt="логотип steem" />
					</div>
					<div className="small-4 medium-3 large-2">
						<img src="images/landing/cyberfund.png" alt="логотип cyber.fund" />
					</div>
					<div className="small-4 medium-3 large-2">
						<img src="images/landing/steem.png" alt="логотип steem" />
					</div>
					<div className="small-4 medium-3 large-2">
						<img src="images/landing/cyberfund.png" alt="логотип cyber.fund" />
					</div>
					<div className="small-4 medium-3 large-2">
						<img src="images/landing/steem.png" alt="логотип steem" />
					</div>
				</div>
				<div className="row Press__action">
					{/* <div className="small-12 columns">
						{this.props.button}
						<p className="Press__action__p">Продажа Голоса закончиться при достижении 3300 ฿</p>
					</div> */}
				</div>
				<hr />
			</section>
		)
	}
}
