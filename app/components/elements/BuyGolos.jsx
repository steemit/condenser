import React from 'react'
import {call, put, select} from 'redux-saga/effects';
import {once, filter, includes} from 'lodash'
import {connect} from 'react-redux'
import transaction from 'app/redux/Transaction'
import LoadingIndicator from 'app/components/elements/LoadingIndicator'
import {PrivateKey} from 'shared/ecc'
import {key_utils} from 'shared/ecc'
import Apis from 'shared/api_client/ApiInstances'
import { translate, translateHtml } from 'app/Translator';
import CopyToClipboard from 'react-copy-to-clipboard';
import ClipboardIcon from 'react-clipboard-icon'
import o2j from 'shared/clash/object2json'
import { calculateCurrentStage, currentStage } from '../elements/LandingCountDowns.jsx';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import Tooltip from 'app/components/elements/Tooltip';
import roundPrecision from 'round-precision'
import icoDestinationAddress from 'shared/icoAddress'
import { injectIntl } from 'react-intl';

const satoshiPerCoin=100000000;

/*
	Логика компонента:
	Если пользователь находится на своей странице, и если у него нет Btc адреса, то должна отображаться кнопка генерации адреса.
	Если у пользователя есть BTC адрес, то необходимо отразить аддрес, qr code и табличку с предыдущими транзакциями.
	Если пользователь находится НЕ на своей странице, то отобразить предыдущие транзакции, если они есть.
*/

// filters blockcypher transactions to include only these where destination is crowdsale addresses
// fulllResponse - blockcypher return from address/<>/full query
// source address - user address where he sends Btc
// destiation address ico multisig address
function getFilteredTransactions(fullResponse, sourceAddress, destinationAddress) {
	const ret = filter(fullResponse.txs, tx => {
		return includes(tx.addresses, destinationAddress)
		&& includes(tx.addresses, sourceAddress) && !tx.double_spend;
	});
	return ret;
}

// returns received by crowdsale amount in satoshis within single transaction
function transactionOutputsSum(tx, destinationAddress) {
	const interestingOutputs = filter(tx.outputs, output => {
			return includes( output.addresses, destinationAddress)});
	let satoshiDestinationReceived = 0
	interestingOutputs.forEach(output => satoshiDestinationReceived+=output.value)
	return satoshiDestinationReceived;
}

function displayConfirmations(nConf) {
	if (nConf == 0) return <span style={{color: 'red'}}> транзакция не подтверждена </span>;
	if (nConf == 1) return <span style={{color: 'red'}}> 1 подтверждение </span>;
	if (nConf == 2) return <span style={{color: 'red'}}> 2 подтверждения </span>;
	if (nConf == 3) return <span style={{color: 'green'}}> 3 подтверждения </span>;
	if (nConf == 4) return <span style={{color: 'green'}}> 4 подтверждения </span>;
	if (nConf == 5) return <span style={{color: 'green'}}> 5 подтверждений </span>;
	return <span> транзакция подтверждена </span>;
}

@injectIntl
class BuyGolos extends React.Component {

	state = {
		icoAddress: '',
		transactions: [],
		fundsRaisedByDate: {},
        error: '',
		loading: false,
		checkboxesClicked: [false, false, false],
		checkboxClicked0: false,
		checkboxClicked1: false,
		checkboxClicked2: false,
		confirmedBalance: false,
		balanceIncludingUnconfirmed: false,
		unconfirmedBalanceOnly: false,
		unconfirmedTxsCount: false,
	}

	handleCheckBoxClick(checkboxNumber, e) {
		// e.preventDefault()
		const checkboxIdentifier = 'checkboxClicked' + checkboxNumber
		const checkbox = this.state[checkboxIdentifier]
		this.setState({ [checkboxIdentifier]: !checkbox })
	}

	generateAddress = event => {
		event && event.preventDefault()

		const {checkboxClicked0, checkboxClicked1, checkboxClicked2} = this.state
		// function isTrue(item) {
		// 	console.log('true', true)
		// 	return item === true
		// }
		if (!(checkboxClicked0, checkboxClicked1, checkboxClicked2)) {
			console.log('error will occure')
			this.setState({
				error: 'Чтобы продолжить, установите этот флажок. Просим Вас внимательно отнестиcь к данной информации во избежание недопонимания.'
			})
			return
		}

		let {metaData, accountname, account} = this.props

		this.setState({ loading: true })

		fetch('/api/v1/generate_ico_address', {
			method: 'post',
			mode: 'no-cors',
			credentials: 'same-origin',
			headers: {
				Accept: 'application/json',
				'Content-type': 'application/json'
			},
			body: JSON.stringify({csrf: $STM_csrf})
		})
		.then(function(data) { return data.json() })
		.then(({icoAddress}) => {
			console.log('icoAddress', icoAddress)
			if (!metaData) metaData = {}
			if (metaData == '{created_at: \'GENESIS\'}') metaData = {created_at: "GENESIS"}
			metaData.ico_address = icoAddress
			metaData = o2j.ifObjectToJSON(metaData);
			this.props.updateMeta({
				json_metadata: metaData,
				account: accountname,
				memo_key: account.memo_key,
				errorCallback: () => {
					this.setState({
						loading: false,
						error: 'server returned error'
					})
				},
				successCallback: () => {
					this.setState({
						icoAddress,
						loading: false,
					})
				}
			})
		})
		.catch(error => {
			// TODO dont forget to add error display for user
			this.setState({
				loading: false,
				error: error.reason
			})
			console.error('address generation failed', error)
		})
	}

	componentDidMount() {
		// if (process.env.BROWSER) this.generateAddress()
		if (process.env.BROWSER) this.fetchTransations()
	}

	fetchTransations = () => {
		const icoAddress = this.state.icoAddress || this.props.icoAddress
		console.log('icoAddress', icoAddress)
		if (!icoAddress) return
		console.log('fetching in progress!')
		fetch(`https://api.blockcypher.com/v1/btc/main/addrs/${icoAddress}/full?confirmations=0`)
		.then(function(data) { return data.json() })
		.then((txObject) => {
			console.log('icoAddressTrans', txObject)
			this.setState({	transactions:  getFilteredTransactions(txObject,
					icoAddress, icoDestinationAddress) });
		})
		.catch(error => {
			// TODO dont forget to add error display for user
			// this.setState({ error: error.reason })
			console.error('transactions fetch failed', error)
		});


		fetch(`https://api.blockcypher.com/v1/btc/main/addrs/${icoDestinationAddress}/balance`)
		.then(function(data) { return data.json() })
		.then((icoBalanceObject) => {
			console.log('icoBalanceObject.balance', icoBalanceObject.balance)
			this.setState({
				confirmedBalance: icoBalanceObject.balance,
				balanceIncludingUnconfirmed: icoBalanceObject.final_balance,
				unconfirmedBalanceOnly: icoBalanceObject.unconfirmed_balance,
				unconfirmedTxsCount: icoBalanceObject.unconfirmed_n_tx
			});

			fetch('/api/v1/get_raised_amounts').then(function(d) { return d.json() })
			.then((data) => {
				console.log('received data', data);
				if (data.status !== 'ok') {
					console.log("fetching intermediate raised amounts failed");
					return;
				} else {
					data = data.data;
				}
				data = data.map(function(item){
					let ret = {}; ret[item.kk] = item;
					return ret;
				});
				console.log('transformed data', data)
			})
			.catch(error => {
				console.log("fetching intermediate raised amounts failed");
				throw(error);
			})
		})
		.catch(error => {
			// TODO dont forget to add error display for user
			// this.setState({ error: error.reason })
			console.error('transactions fetch failed', error)
		})


	}

	render() {
		if (!process.env.BROWSER) { // don't render this page on the server
				return <div className="row">
						<div className="column">
								{translate('loading')}..
						</div>
				</div>;
		}

		const {state, props} = this
		const {
      intl,
			metaData,
			icoAddress,
			routeParams: {accountname},
		} = props
		const { transactions } = state
		let loading=this.state.loading
		return 	<div id="buy_golos" className="BuyGolos">
					<div className="row">
						<div className="columns small-12">
							<h2>ПОКУПКА СИЛЫ ГОЛОСА</h2>
							<hr style={{marginBottom: '50px'}} />
						</div>
					</div>

					{/* GENERATE ADDRESS */}
					{
						props.isOwnAccount && (!state.icoAddress && !props.icoAddress)
						? 	<form className="columns row" onSubmit={this.generateAddress}>
								<div className="large-12 columns">
									<label htmlFor="checkbox1">
										<input onClick={this.handleCheckBoxClick.bind(this, 0)} id="checkbox1" type="checkbox" disabled={loading} />
										Я прочитал и ознакомлен с условиями сообщества описанными в документе: <br />
										<span style={{marginLeft: 20}}>Голос: <a href="https://golos.io/ru--golos/@golos/golos-russkoyazychnaya-socialno-mediinaya-blokchein-platforma">Русскоязычная социально-медийная блокчейн-платформа</a></span>
									</label>
									{
										state.checkboxClicked0
										? null
										: <small className="error">{state.error}</small>
									}
									<label htmlFor="checkbox2">
										<input onClick={this.handleCheckBoxClick.bind(this, 1)} id="checkbox2" type="checkbox" disabled={loading} />
										Я ознакомлен и принимаю условия <a href="https://golos.io/ru--golos/@golos/dogovor-kupli-prodazhi-tokenov-sila-golosa">Договор купли-продажи токенов "СИЛА ГОЛОСА"</a>
									</label>
									{
										state.checkboxClicked1
										? null
										: <small className="error">{state.error}</small>
									}
									<label htmlFor="checkbox3">
										<input onClick={this.handleCheckBoxClick.bind(this, 2)} id="checkbox3" type="checkbox" disabled={loading} />
										Я ознакомлен с <a href="https://golos.io/ru--riski/@golos/raskrytie-riskov">рисками</a>
									</label>
									{
										state.checkboxClicked2
										? null
										: <small className="error">{state.error}</small>
									}
									<div className="column small-12 text-center">
										<input type="submit" className="button" value="Получить биткоин адрес" disabled={loading} />
									</div>
								</div>
							</form>
						: 	null
					}

					{/* ADDRESS + CURRENT STAGE INFO + QR CODE */}
					{
						// TODO change this checker to use 'else' of previous one?
						props.isOwnAccount && (state.icoAddress || props.icoAddress)
						? <div className="row">
							<div className="column">
								<div className="small-12 text-center">
									<h3>
										<strong>
											{props.icoAddress || state.icoAddress}&nbsp;
											<CopyToClipboard text={props.icoAddress || state.icoAddress}>
												<a><ClipboardIcon title="скопировать в буфер обмена" /></a>
											</CopyToClipboard>
											{/* <ClipboardButton data-clipboard-text={props.icoAddress || state.icoAddress}>
												<ClipboardIcon title="скопировать в буфер обмена" />
											</ClipboardButton> */}
										</strong>
									</h3>
								</div>
							</div>
							<div className="column small-12">
								<img style={{display: 'block', margin: 'auto'}} src={`https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${props.icoAddress || state.icoAddress}`} alt="QR код вашего bitcoin адреса" />
							</div>
							<div className="column small-12 text-center">
								<table>
									<thead>
										<tr>
											<th className="text-center" width="150">Минимальная Покупка</th>
											<th className="text-center" width="150">Максимальная Покупка</th>
											<th className="text-center" width="100">Текущий Бонус</th>
											<th className="text-center" width="100">Бонус уменьшится</th>
										</tr>
									</thead>
									<tbody>
									<tr>
										<td>0.001 биткоина</td>
										<td>100 биткоинов</td>
										<td>{calculateCurrentStage()}%</td>
										<td>
										<Tooltip t={new Date(currentStage.date).toLocaleString()}>
											<span className="TimeAgo"><TimeAgoWrapper date={currentStage.date} /></span>
										</Tooltip>
										</td>
										{/* 25 дней */}
									</tr>
									</tbody>
								</table>
							</div>

							<div className="column small-12">
								<p><b>Сила Голоса</b> - неперемещаемые цифровые токены. Их оценка в Голосах увеличивается при долгосрочном хранении. Чем их больше, тем сильней вы влияете на вознаграждения за пост и тем больше зарабатываете за голосование. Также Сила Голоса дает право записывать любые данные в блокчейн Голоса. Чем больше Силы Голоса, тем большая доля в пропускной способности гарантируется Вам сетью Голос. Перевод Силы Голоса в Голоса занимает 104 недели равными частями.</p>
								<p>Если у Вас нет биткоинов, то Вы можете их купить за любую национальную валюту на <a href="https://localbitcoins.net/">Localbitcoins.net</a>. Также сообществом Голос организованы разные сервисы по участию в краудсейле. Инструкции по покупке можно найти по тэгу <a href="/trending/ru--kupitxbitkoin">#КупитьБиткоин</a>.</p>
							</div>
						</div>
						: null
					}

					{/* TRANSACTION HISTORY */}
					{
						transactions.length && state.confirmedBalance
						? <div className="row">
							<div className="column small-12">
								<table>
									<thead>
										<tr>
											<th width="200">ID Транзакции</th>
                      <th width="100">Перечислено биткоинов</th>
											<th width="100">Бонус</th>
											{/* <th width="150">Вы получите Голосов</th> */}
											{/* <th width="50">Доля в Сети</th> */}
										</tr>
									</thead>
									<tbody>
										{
											transactions.map((item, index) => {
												const golosAmount = 27072000*transactionOutputsSum(item, icoDestinationAddress)/state.confirmedBalance
												const sharePercentage = (golosAmount/43306176) * 100
                        const localizedDate = intl.formatDate(item.confirmed)
                        const confirmedDate = new Date(item.confirmed)
												return 	<tr key={index}>
															<td>{item.hash}<br />({localizedDate}); {displayConfirmations(item.confirmations)}</td>
															<td>{roundPrecision(transactionOutputsSum(item, icoDestinationAddress)/satoshiPerCoin, 8)}</td>
                              <td>{calculateCurrentStage(confirmedDate)}%</td>
															{/* <td>{roundPrecision(golosAmount, 3)}</td> */}
															{/* <td>{roundPrecision(sharePercentage, 6) + '%'}</td> */}
														</tr>
											})
										}
									</tbody>
								</table>
								<p>Количество получаемых токенов Силы Голоса отображается исходя из полученных биткоинов на данный момент. Всего на краудсейле будет продано 27 072 000 токенов Силы Голоса (60% сети). Сила Голоса будет распределена пропорционально проинвестированным биткоинам с учетом бонусов. Чем больше биткоинов будет проинвестировано, тем меньше Силы Голоса вы получите, тем выше будет её цена.</p>
							</div>
						</div>
						: transactions.length
						? <div>
							<hr />
							<p>история транзакций загружается...</p>
						</div>
						: null
					}
				</div>
	}
}

export default connect(
	(state, props) => {
		const {accountname} = 	props.routeParams
		const current_user 	= 	state.user.get('current')
		const username 		=	current_user ? current_user.get('username') : ''
		const account 		= 	state.global.getIn(['accounts', accountname]).toJS()
		const metaData 		=	account ? o2j.ifStringParseJSON(account.json_metadata) : {}

		return {
			account,
			username,
			metaData,
			accountname,
			current_user,
			isOwnAccount: username == accountname,
			icoAddress: metaData ? metaData.ico_address : ''
		}
	},
    dispatch => ({
		updateMeta: ({successCallback, errorCallback, ...operation}) => {
			dispatch(transaction.actions.broadcastOperation(
				{type: 'account_update', operation, successCallback, errorCallback}
			))}
    })
)(BuyGolos)
