import React from 'react'
import isEmpty from 'lodash/isEmpty';
import {connect} from 'react-redux';

// fetch data
@connect(
	state => {
		const current_user 	= 	state.user.get('current')
		const accountImm 	= 	current_user
								? state.global.getIn(['accounts', current_user.name])
								: {}

		let account = {}
		if (!isEmpty(accountImm) && accountImm) account = accountImm.toJS()
		// const current_account = current_user && state.global.getIn(['accounts', current_user.get('username')])
		return {
			discussions: state.global.get('discussion_idx'),
			global: state.global,
			current_user,
			account
			// current_account,
		};
	}
)
export default class BuyGolos extends React.Component {

	state = {
		icoAddress: '',
		transactions: [],
		isOwnAccount: false,
		checkingInProgress: false,
		accountHaveBeenChecked: false,
		metaData: this.props.account.json_metadata || {},
	}

	checkAccount = () => {
		this.setState({ checkingInProgress: true })

		let user = this.props.current_user
		user = user && user._root && user._root.entries;
		let username = user.find(it => it[0] == 'username')
		username = username[1]
		const accountname = this.props.account && this.props.account.name
		const isOwnAccount = username && (username === accountname)

		this.setState({
			checkingInProgress: false,
			accountHaveBeenChecked: true,
			isOwnAccount: username && (username === accountname)
		})

		if (isOwnAccount && !this.state.icoAddress) this.generateAddress()
	}

	setAddress = () => {
		const metaData = JSON.parse(this.state.metaData)
		const icoAddress = metaData && metaData.ico_address
		this.setState({ icoAddress })
	}

	generateAddress = () => {
		//
		// some logic here
		//
		// set address in the end
		// this.setState({ icoAddress })
	}

	testClick = () => {
		console.log(this.icoAddress)
		console.log(this.state.metaData)
		console.log(this.props.current_user)
		console.log("is own: " + this.state.isOwnAccount)
	}

	render() {
		const {
			metaData,
			icoAddress,
			isOwnAccount,
			transactions,
			bitcoinAddress,
			checkingInProgress,
			accountHaveBeenChecked
		} = this.state

		// run necessery checks
		if (!icoAddress && !isEmpty(metaData)) this.setAddress()
		if (!checkingInProgress && !isOwnAccount && accountHaveBeenChecked) this.checkAccount()

		return 	<div id="buy_golos" className="row">
					<div className="column small-9 text-center">
						<h2>Покупка Голосов</h2>
						<p>{icoAddress}</p>
						<p>Перечислите биткоины сюда.</p>
						<p>Вы покупаете Силу Голоса неликвидные</p>
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
