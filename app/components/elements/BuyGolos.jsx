import React from 'react'
import {call, put, select} from 'redux-saga/effects';
import once from 'lodash/once'
import {connect} from 'react-redux'
import transaction from 'app/redux/Transaction'
import LoadingIndicator from 'app/components/elements/LoadingIndicator'
import {PrivateKey} from 'shared/ecc'
import {key_utils} from 'shared/ecc'
import Apis from 'shared/api_client/ApiInstances'
import { translate, translateHtml } from '../../Translator';
import CopyToClipboard from 'react-copy-to-clipboard';
import ClipboardIcon from 'react-clipboard-icon'
import o2j from 'shared/clash/object2json'
import { calculateCurrentStage, currentStage } from '../elements/LandingCountDowns.jsx';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import Tooltip from 'app/components/elements/Tooltip';
//import {test as o2jtest} from 'shared/clash/object2json'

/*
	Логика компонента:
	Если пользователь находится на своей странице, и если у него нет Btc адреса, то должна отображаться кнопка генерации адреса.
	Если у пользователя есть BTC адрес, то необходимо отразить аддрес, qr code и табличку с предыдущими транзакциями.
	Если пользователь находится НЕ на своей странице, то отобразить предыдущие транзакции, если они есть.
*/



class BuyGolos extends React.Component {

	state = {
		icoAddress: '',
		transactions: [],
        error: '',
		loading: false,
		checkboxesClicked: [false, false, false],
		checkboxClicked0: false,
		checkboxClicked1: false,
		checkboxClicked2: false,
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
			if (metaData == '{created_at: \'GENESIS\'}') metaData = {created_at: "GENESIS"}
			if (typeof metaData === 'string') metaData = {}
			metaData.ico_address = icoAddress
			metaData = o2j.ifObjectToJSON(metaData);
			this.props.updateMeta({
					json_metadata: metaData,
					account: accountname,
					memo_key: account.memo_key,
					onError: () => this.setState({
						loading: false,
						error: 'server returned error'
					}),
					onSuccess: () => this.setState({
						icoAddress,
						loading: false,
					})
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

	removeIco = () => {
		let {metaData} = this.props
		const {accountname, account} = this.props
		console.log('metaData', metaData)
		metaData.ico_address = ''
		metaData = o2j.ifObjectToJSON(metaData);
		this.props.updateMeta({
			account: accountname,
			json_metadata: metaData,
			memo_key: account.memo_key,
			onError: () => this.setState({
				loading: false,
				error: 'server returned error'
			}),
			onSuccess: () => this.setState({
				icoAddress: '',
				loading: false,
			})
		})
	}


	componentDidMount() {
		// if (process.env.BROWSER) this.generateAddress()
	}

	testFormSubmit() {
		console.log(this.icoAddress)
		console.log(this.props)
		console.log("is own: " + this.state.isOwnAccount)

		const k = "foo"
		const v = "bar"
		const p = ""
		const u = "tester"
		let meta = o2j.ifStringParseJSON(this.props.metaData);
    if (typeof meta==='string')
      meta = {created_at: "Genesis"}
		meta[k] = v;
		meta = o2j.ifObjectToJSON(meta);
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
			metaData,
			icoAddress,
			routeParams: {accountname},
		} = props
		const { transactions } = state
		let loading=this.state.loading

		return 	<div id="buy_golos" className="row BuyGolos">

					{/* ACTUAL COMPONENT */}
					{/* <div className="columns small-12">
						<h2>Макет функционала</h2>
						<hr />
					</div> */}
					<button className="button warning" onClick={this.removeIco}>REMOVE ICO ADDRESS</button>
					<div className="columns small-12">
						<h2>ПОКУПКА СИЛЫ ГОЛОСА</h2>
						<hr style={{marginBottom: '50px'}} />
					</div>

					{/* GENERATE ADDRESS */}
					{
						props.isOwnAccount && (!state.icoAddress && !props.icoAddress)
						? 	<form className="columns small-12" onSubmit={this.generateAddress}>
								<div className="large-12 columns">
									<label htmlFor="checkbox1">
										<input onClick={this.handleCheckBoxClick.bind(this, 0)} id="checkbox1" type="checkbox" disabled={loading} />
										Я прочитал и ознакомлен с условиями сообщества описанными в документе: <br />
										<span style={{marginLeft: 20}}>Голос: <a href="https://wiki.golos.io/1-introduction/golos_whitepaper.html">Русскоязычная социально-медийная блокчейн-платформа</a></span>
									</label>
									{
										state.checkboxClicked0
										? null
										: <small className="error">{state.error}</small>
									}
									<label htmlFor="checkbox2">
										<input onClick={this.handleCheckBoxClick.bind(this, 1)} id="checkbox2" type="checkbox" disabled={loading} />
										Я ознакомлен и принимаю условия <a href="/legal/sale_agreements.pdf">Договор купли-продажи токенов "СИЛА ГОЛОСА"</a>
									</label>
									{
										state.checkboxClicked1
										? null
										: <small className="error">{state.error}</small>
									}
									<label htmlFor="checkbox3">
										<input onClick={this.handleCheckBoxClick.bind(this, 2)} id="checkbox3" type="checkbox" disabled={loading} />
										Я ознакомлен с <a href="/legal/risk_disclosure.pdf">рисками</a>
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
						transactions.length
						? <div className="column small-12">
							<table>
								<thead>
									<tr>
										<th width="200">ID Транзакции</th>
										<th width="100">Перечислено биткоинов</th>
										<th width="150">Вы получите</th>
										<th width="50">Доля в Сети</th>
									</tr>
								</thead>
								<tbody>
									{
										transactions.map((item, index) => {
											return 	<tr key={index}>
														<td>{item.address}</td>
														<td>{item.amountBtc}</td>
														<td>{item.amountGolos + ' Силы Голоса'}</td>
														<td>{item.share + ' %'}</td>
													</tr>
										})
									}
								</tbody>
							</table>
							<p>Количество получаемых токенов Силы Голоса отображается исходя из полученных биткоинов на данный момент. Всего на краудсейле будет продано 27 072 000 токенов Силы Голоса (60% сети). Сила Голоса будет распределена пропорционально проинвестированным биткоинам с учетом бонусов. Чем больше биткоинов будет проинвестировано, тем меньше Силы Голоса вы получите, тем выше будет её цена.</p>
						</div>
						: null
					}

					{/* <div className="columns small-12">
						<br />
						<hr />
						<h2>Test</h2>
					</div>
					<form onSubmit={this.handleSubmit} className="columns small-12">
						<label>
								key
								<br />
								<input id="meta-key" type="text" disabled={loading} />
						</label>
						<label>
								value
								<br />
								<input id="meta-value" type="text" disabled={loading} />
						</label>
						<label>
								enter password here
								<br />
								<input id="meta-password" type="password" disabled={loading} />
						</label>
						<button type="submit" className="button" disabled={loading}>
								change meta
						</button>
					</form>

					{/* TEST INFO
					<div className="columns small-12">
						<h2>Тестовая информация</h2>
					</div>
					<div className="columns small-12">
						<span>Юзер залогинен?</span>
						{
							metaData
							? <div>
								<small>metaData пользователя:</small>
								<p>{JSON.stringify(metaData)}</p>
							</div>
							: null
						}
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
					</div> */}
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
		updateMeta: (operation) => {
			const options = {
				type: 'account_update',
				operation
            }

			console.log(options)
			dispatch(transaction.actions.broadcastOperation(options)) //broadcastOperation


        },

    })
)(BuyGolos)
