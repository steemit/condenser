import React from 'react'

export default class LandingBlockchainRevolution extends React.Component {
	render() {
		const texts = [
			'Отсутствие цензурирования',
			'Доход от постов и лайков',
			'Математический нотариат',
			'Приватные сообщения',
			'Открытый код',
			'Открытые данные',
			'Неподкупный алгоритм',
			'Неизменность истории',
			'Отсутствие рекламы',
			'Сам себе банк',
			'Стабильная валюта'
		]

		return (
			<section className="BlockchainRevolution">
				<div className="row text-center">
					<div className="BlockchainRevolution__header small-12 columns">
						<h2 id="revolution">Блокчейн-революция</h2>
						<p>«Революцию, которую произвел интернет, можно повторить, перевернув человеческие взаимоотношения, убрав посредника не только из денежных переводов, как предлагал биткоин, но из любой сферы»</p>
						<span className="BlockchainRevolution__supporting-text"> — уверен Виталий Бутерин, создатель нашумевшего стартапа Ethereum.</span>
					</div>
				</div>
				<div className="row BlockchainRevolution__table">
					<div className="small-12 columns">
						<table>
							<thead>
								<tr>
									<th width="200" className="text-left">Социальные сети</th>
									<th width="100" className="text-center"><img src="images/landing/golos.png" alt="лого проекта Голос" /></th>
									<th width="100" className="text-center"><img src="images/landing/vkontakte.jpg" alt="лого VK" /></th>
									<th width="100" className="text-center"><img src="images/landing/facebook.jpg" alt="лого Facebook" />	</th>
								</tr>
							</thead>
							<tbody>
								{
									texts.map((item, index) => {
										return 	<tr key={index} className="text-center">
													<td className="text-left"><strong>{item}</strong></td>
													<td><img data-wow-delay="1s" className="wow bounceIn" src="images/landing/checked.gif" /></td>
													<td><img src="images/landing/unchecked.gif" /></td>
													<td><img src="images/landing/unchecked.gif" /></td>
												</tr>
									})
								}
							</tbody>
						</table>
					</div>
				</div>
				<div className="row BlockchainRevolution__action">
					<div className="small-12 columns text-center">
						{/* <a href="" className="button">Узнать больше, что такое Голос</a> */}
					</div>
				</div>
				<hr />
			</section>
		)
	}
}
// «Революцию, которую произвел интернет, можно повторить, перевернув человеческие взаимоотношения, убрав посредника
// не только из денежных переводов, как предлагал биткоин,
// но из любой сферы»
//
//
//  — уверен Виталий Бутерин, создатель нашумевшего стартапа Ethereum.
