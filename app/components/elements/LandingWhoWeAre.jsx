import React from 'react'

export default class LandingWhoWeAre extends React.Component {
	render() {
		return (
			<section>
				<div className="row text-center">
					<div className="Landing__header small-12 columns">
						<h2>Кто мы?</h2>
						<span className="Landing__header">Децентрализованная социальная сеть для блоггеров и журналистов</span>
					</div>
				</div>
				<div className="row">
					<div className="small-12 columns">
						<table>
							<thead>
								<tr>
									<th width="200">Table Header</th>
									<th>Table Header</th>
									<th width="150">Table Header</th>
									<th width="150">Table Header</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>Content Goes Here</td>
									<td>This is longer content Donec id elit non mi porta gravida at eget metus.</td>
									<td>Content Goes Here</td>
									<td>Content Goes Here</td>
								</tr>
								<tr>
									<td>Content Goes Here</td>
									<td>This is longer Content Goes Here Donec id elit non mi porta gravida at eget metus.</td>
									<td>Content Goes Here</td>
									<td>Content Goes Here</td>
								</tr>
								<tr>
									<td>Content Goes Here</td>
									<td>This is longer Content Goes Here Donec id elit non mi porta gravida at eget metus.</td>
									<td>Content Goes Here</td>
									<td>Content Goes Here</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<div className="row">
					<div className="small-12 columns">
						<button className="button">Узнайте больше, что такое Голос</button>
					</div>
				</div>
				<hr />
			</section>
		)
	}
}
