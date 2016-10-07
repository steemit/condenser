import React from 'react'

export default class Accordion extends React.Component {
	state = {
		activeTab: 0
	}

	setActiveTab = activeTab => this.setState({activeTab})

	render() {
		const {activeTab} = this.state
		const elements = this.props.elements.map(
				(item, index) => 	{
				const isActiveTab = activeTab == index
				const classModifier = isActiveTab ? '_active' : '_hidden'
				const questionIcon = isActiveTab ? 'open_qustion.jpg' : 'closed_question.jpg'
	 			return	<div key={index} className='Accordion__item' onClick={this.setActiveTab.bind(this, index)}>
							<img className="Accordion__icon" src={"images/landing/" + questionIcon} />
							<strong>{item.title}</strong>
							<div className={'Accordion__content Accordion__content' + classModifier}>{item.content}</div>
						</div>
				}
		)

		return 	<div className="Accordion">
					{elements}
				</div>
	}
}
