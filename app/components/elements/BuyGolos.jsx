import React from 'react'

export default class BuyGolos extends React.Component {
	render() {
		const {props} = this
		return 	<div className="row" {...props}>
					<div className="column small-9 text-center">
						<h2>Покупка Голосов</h2>
						<p>1NBSbGHeDCTt9a6qD58egvyz6ouvLRa</p>
						<p>Перечислите биткоины сюда.</p>
						<p>Вы покупаете Силу Голоса не леквидные</p>
					</div>
					<div className="column small-3">
						<img src="http://orig13.deviantart.net/a337/f/2013/160/7/6/8_bit_qr_code__sonic_by_mattcantdraw-d68d4kw.jpg" alt="QR code" height="150" width="150" />
					</div>
					<div className="column small-12">
						<table>
							<thead>
								<tr>
									<th width="150">ID Транзакции</th>
									<th width="250">Перечислено биткоинов</th>
									<th width="100">Вы получите</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>STM7NBSbGHeDCTt9a6qD58egvyz6ouvLR</td>
									<td>212</td>
									<td>498752 Голосов ?</td>
								</tr>
								<tr>
									<td>STM7NBSbGHeDCTt9a6qD58egvyz6ouvLR</td>
									<td>500</td>
									<td>348752 Голосов ?</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
	}
}
