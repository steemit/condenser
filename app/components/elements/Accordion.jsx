import React, {PropTypes} from 'react'

export default class Accordion extends React.Component {

	static propTypes = { elements: PropTypes.array.isRequired }

	state = { activeTab: 0 }

	setActiveTab = activeTab => this.setState({activeTab})

	render() {
		if(!this.props.elements) return null
		const {activeTab} = this.state

		return 	<div className="Accordion">
					{
						this.props.elements.map(
								(item, index) => 	{
								const isActiveTab = activeTab == index
								const classModifier = isActiveTab ? '_active' : '_hidden'
								const questionIcon = isActiveTab ? 'open_qustion.jpg' : 'closed_question.jpg'
					 			return	<div key={index} className='Accordion__item' onClick={this.setActiveTab.bind(this, index)}>
											<div className="row">
												<div className="small-2 medium-1 columns">
													<img className="Accordion__icon" src={"images/landing/" + questionIcon} />
												</div>
												<div className="small-10 medium-11 columns">
													<strong>{item.title}</strong>
													<div className={'Accordion__content Accordion__content' + classModifier}>
														{item.content}
													</div>
												</div>
											</div>
										</div>
								}
						)
					}
				</div>
	}
}
