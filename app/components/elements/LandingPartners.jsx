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
				<div className="row Partners__logos text-center">
					<div className="small-6 medium-3">
						<a href="http://satoshi.fund/" target="blank">
							<img src="images/landing/satoshi_fund.png" alt="логотип satoshi.fund" />
						</a>
					</div>
					<div className="small-6 medium-3">
						<a href="http://kuna.com.ua/" target="blank">
							<img className="Partners__kuna-logo" src="images/landing/kuna.png" alt="логотип Bitup" />
						</a>
					</div>
		          	<div className="small-6 medium-3">
		            	<a className="Partners__mapala-logo" href="http://mapala.net/" target="blank">
		              		<img width="96" src="https://s13.postimg.org/ror54hqyv/logo_small.png" alt="логотип mapala" />
		            	</a>
		          	</div>
					<div className="small-6 medium-3 columns Partners__tolkachev-logo">
						<a href="http://www.atplaw.ru/" target="blank">
							<img className="Partners__tolkachev-logo" src="images/landing/tolkachev2.png" alt='логотип "Толкачев и партнеры"' />
						</a>
					</div>
					<div className="small-6 medium-3 columns">
						<a href="https://dao.casino/" target="blank">
							<img className="Partners__daocasino-logo" src="images/landing/dao-casino.png" alt="логотип dao-casino" />
						</a>
					</div>
					<div className="small-6 medium-3 columns">
						<a href="https://platform.molodost.bz/" target="blank">
							<img src="https://platform.molodost.bz/images/bmproudlogo.png" alt="логотип БM" />
						</a>
					</div>
					<div className="small-6 medium-3 columns">
						<a href="http://forklog.com/" target="blank">
							<img className="Partners__forklog-logo" src="images/landing/forklog-logo.svg" alt="логотип Forklog" />
						</a>
					</div>
					<div className="small-6 medium-3 columns">
						<a href="https://changebot.info/" target="blank">
							<img className="Partners__changebot-logo" src="images/landing/changebot.png" alt="логотип ChangeBot" />
						</a>
					</div>
				</div>
				<hr />
			</section>
		)
	}
}
