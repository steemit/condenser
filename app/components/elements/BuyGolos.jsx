import React from 'react'

export default class BuyGolos extends React.Component {

	state = {
		transactions: [
			{
				address: 'STM7NBSbGHeDCTt9a6qD58egvyz6ouvLR',
				amountBtc: '20',
				amountGolos: '1200'
			},
			{
				address: 'STM7NBSbGHeDCTt9a6qD58egvyz6ouvLR',
				amountBtc: '20',
				amountGolos: '1200'
			},
			{
				address: 'STM7NBSbGHeDCTt9a6qD58egvyz6ouvLR',
				amountBtc: '20',
				amountGolos: '1200'
			},
		],
		bitcoinAddress: '1HgBvtsNYTgbkcHHpDzgJioVSjraTkhzCg',
	}

	/**
	 * if url contains 'buy_golos' scroll to it
	 */
	componentDidMount() {
		if (process.env.BROWSER) {
			if (window.location.href.includes('#buy_golos')) {
				const el = document.getElementById("buy_golos")
				// IE9 does not support .scrollIntoView
				if (!!el && el.scrollIntoView) el.scrollIntoView();
			}
		}
	}

	render() {
		const {bitcoinAddress, transactions} = this.state

		function renderTable() {
			if (!transactions) return null
			return transactions.map((item, index) => {
				return 	<tr key={index}>
							<td>{item.address}</td>
							<td>{item.amountBtc}</td>
							<td>{item.amountGolos}</td>
						</tr>
			})
		}

		return 	<div id="buy_golos" className="row">
					<div className="column small-9 text-center">
						<h2>Покупка Голосов</h2>
						<p>{bitcoinAddress}</p>
						<p>Перечислите биткоины сюда.</p>
						<p>Вы покупаете Силу Голоса не леквидные</p>
					</div>
					<div className="column small-3">
						<img src={`https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${bitcoinAddress}`} alt="your QR code" />
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
								{renderTable()}
							</tbody>
						</table>
					</div>
				</div>
	}
}
