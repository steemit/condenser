import React from 'react'

export default class LandingDocumentation extends React.Component {
	render() {
		return (
			<section>
				<div className="row text-center">
					<div className="Landing__header small-12 columns">
						<h2>Документация</h2>
						<span className="Landing__header">Децентрализованная социальная сеть для блоггеров и журналистов</span>
					</div>
				</div>
				<div className="row">
					<div className="small-12 columns">
						<p>Размещая свой персональный контент в социальных сетях Vkontakte, Facebook и Twitter, пользователи подняли ценность этих компаний до миллиардов долларов, чем обеспечили прибыль только акционерам.</p>
					</div>
					<div className="small-12 columns">
						<p className="LandingDocumentation_smaller-text">В противоположность этому, <span className="text-red">Голос возвращает большую часть своей стоимости</span> в виде вознаграждений в виртуальной валюте всем тем людям, которые своими действиями и вкладом обеспечили эту ценность.</p>
					</div>
				</div>
				<div className="row">
					<div className="small-12 columns">
						<button className="button alert">Про Голос</button>
						<button className="button">Про Стим</button>
					</div>
				</div>
				<hr />
			</section>
		)
	}
}
