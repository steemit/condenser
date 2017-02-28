import React from 'react'

export default class LandingWhatIsGolos extends React.Component {
	render() {
		return (
			<section className="WhatIsGolos text-center" id="what-is-golos">
				<div className="row">
					<div className="small-12 medium-12 large-centered columns columns WhatIsGolos__video">
						<div>
							<iframe width="853" height="480" src="https://www.youtube.com/embed/8a0TPACOu2k" frameBorder="0" allowFullScreen />
						</div>
					</div>
				</div>
				<div className="row WhatIsGolos__action">
					<div className="small-12 columns">
						<a href="/create_account" className="button">Зарегистрируйся</a>
						<p><small>Получи 5 ГОЛОСОВ бесплатно</small></p>
					</div>
				</div>
				<hr />
			</section>
		)
	}
}
