import React from 'react'
import once from 'lodash/once'
import {connect} from 'react-redux'

// fetch data
@connect(
	(state, props) => {
		const {accountname} = 	props.routeParams
		const current_user 	= 	state.user.get('current')
		const username 		=	current_user ? current_user.get('username') : ''
		const account 		= 	state.global.getIn(['accounts', accountname]).toJS()
		const metaData 		=	account ? account.json_metadata : {}

		return {
			account,
			username,
			metaData,
			accountname,
			current_user,
			isOwnAccount: username == accountname,
			icoAddress: metaData ? metaData.ico_address : ''
		}
	}
)
export default class BuyGolos extends React.Component {

	state = {
		icoAddress: '',
		transactions: [],
	}

	componentWillReceiveProps() {
		if (process.env.BROWSER && this.props.current_user && !this.props.icoAddress) this.generateAddress()
	}

	generateAddress = once(
		function () {
			// some logic here
			//
			// set address in the end
			this.setState({ icoAddress: 'адресс не сгенерирован' })
	})

	testClick = () => {
		console.log(this.icoAddress)
		console.log(this.props.metaData)
		console.log(this.props.current_user)
		console.log("is own: " + this.state.isOwnAccount)
	}
	// runOnce = once(this.generateAddress)

	render() {
		const {state, props} = this
		const {
			metaData,
			icoAddress,
			routeParams: {accountname},
		} = props
		const { transactions } = state

		return 	<div id="buy_golos" className="row">

					{/* TEST INFO */}
					<div className="columns small-12">
						<h2>Тестовая информация</h2>
					</div>
					<div className="columns small-12">
						<span>Юзер залогинен?</span>
						<div className="switch large">
							<input className="switch-input" id="isLoggedIn" type="checkbox" checked={props.current_user} />
							<label className="switch-paddle" htmlFor="isLoggedIn">
								<span className="switch-active">Да</span>
								<span className="switch-inactive">Нет</span>
							</label>
						</div>
						<span>Юзер смотрит свою страницу?</span>
						<div className="switch large">
							<input className="switch-input" id="isOwnPage" type="checkbox" checked={props.username == accountname} />
							<label className="switch-paddle" htmlFor="isOwnPage">
								<span className="switch-active">Да</span>
								<span className="switch-inactive">Нет</span>
							</label>
						</div>
						<span>Есть ли у юзера ico address?</span>
						<p>{state.icoAddress}</p>
						<p>{props.icoAddress}</p>
						<div className="switch large">
							<input className="switch-input" id="hasIco" type="checkbox" checked={Boolean(metaData && metaData.ico_address)} />
							<label className="switch-paddle" htmlFor="hasIco">
								<span className="switch-active">Да</span>
								<span className="switch-inactive">Нет</span>
							</label>
						</div>
						<span>Есть ли у юзера предыдущие транзакции?</span>
						<div className="switch large">
							<input className="switch-input" id="hasTransactions" type="checkbox" checked={false} />
							<label className="switch-paddle" htmlFor="hasTransactions">
								<span className="switch-active">Да</span>
								<span className="switch-inactive">Нет</span>
							</label>
						</div>
					</div>

					{/* ACTUAL COMPONENT */}
					<div className="columns small-12">
						<h2>Макет функционала</h2>
					</div>
					<div className="column small-9 text-center">
						<h2>Покупка Голосов</h2>
						<p>{icoAddress}</p>
						<p>Перечислите биткоины сюда.</p>
						<p>Вы покупаете Силу Голоса неликвидные</p>
					</div>
					<div className="column small-3">
						<img src={`https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${icoAddress}`} alt="your QR code" />
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
								{
									transactions.map((item, index) => {
										return 	<tr key={index}>
													<td>{item.address}</td>
													<td>{item.amountBtc}</td>
													<td>{item.amountGolos}</td>
												</tr>
									})
								}
							</tbody>
						</table>
					</div>
					<div className="column small-12">
						<button onClick={this.testClick}>"Clatz me"</button>
						<span>{icoAddress}</span>
					</div>
				</div>
	}
}
