import React from 'react'

export default class LandingFaq extends React.Component {

	render() {
		return (
			<section className="Faq" id="faq">
				<div className="row text-center Faq__headers">
					<div className="small-12 columns">
						<h2 className="blue">Вопросы - ответы</h2>
						<span className="Faq__supporting-text">Узнай больше о Голосе</span>
					</div>
				</div>
				<div className="row Faq__action text-center">
					<div className="small-12 columns">
						<p className="Faq__p">Если у Вас остались вопросы, то</p>
						<a href="mailto:support@golos.io" target="blank" className="button">Напишите нам и получите ответы</a>
					</div>
				</div>
				<hr />
			</section>
		)
	}
}
