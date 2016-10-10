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
					<ul>
						<li><a href="https://www.cryptocoinsnews.com/new-blockchain-social-media-platform-speaks-with-a-russian-voice/" target="_blank">Cryptocoinnews</a></li>
						<li><a href="http://forklog.com/detsentralizovannaya-sotsialnaya-set-steemit-poluchit-otdelnyj-russkoyazychnyj-proekt/" target="_blank">Forklog</a></li>
						<li><a href="http://www.econotimes.com/CyberFund-launches-first-blockchain-based-Russian-social-network-Voice-332085" target="_blank">Econotimes</a></li>
						<li><a href="http://www.coinfox.ru/novosti/6457-kiber-fond-sozdast-russkoyazychnuyu-sotsset-na-blokchejne-steem" target="_blank">Coinfox</a></li>
						<li><a href="http://www.osp.ru/cw/2016/13/13050329/" target="_blank">OSP</a></li>
						</ul>
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
