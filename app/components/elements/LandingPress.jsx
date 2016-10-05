import React from 'react'

export default class LandingPress extends React.Component {
	render() {
		return (
			<section>
				<div className="row text-center">
					<div className="small-12 columns">
						<h2 className="Landing__h2_blue">Пресса</h2>
					</div>
				</div>
				<div className="row">
					<div className="small-12 columns">
						{this.props.button}
					</div>
				</div>
				<hr />
			</section>
		)
	}
}
