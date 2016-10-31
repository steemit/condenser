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

import o2j from 'shared/clash/object2json'
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
	}

	generateAddress = event => {
		event && event.preventDefault()
		this.setState({ loading: true })
		let {metaData, accountname} = this.props
		console.log('metaData', metaData)
		metaData = JSON.parse(metaData)
		metaData.foo = 'bar'
		metaData = o2j.ifObjectToJSON(metaData);
        // metaData = JSON.stringify(metaData);
		console.log('metaData', metaData)
        if (this.props.username) {
          const generator = this.props.updateMeta({
	    			account_name: accountname,
	    			meta: metaData,
					signingKey:  '5Kha8QKTLsT2prVZEwKAf3JVmmjmdAvRP2zinUSAXy1SuGc5EDa',
					onError: () => this.setState({error: 'server returned error'}),
					onSuccess: () => this.setState({error: 'SUCCESS'})
			})
        }
		// fetch('/api/v1/generate_ico_address', {
		//     method: 'post',
		//     mode: 'no-cors',
		//     credentials: 'same-origin',
		//     headers: {
		//         Accept: 'application/json',
		//         'Content-type': 'application/json'
		//     },
		//         body: JSON.stringify({csrf: $STM_csrf})
		//     })
		// 	.then(function(data) {
		// 		return data.json() })
		// 	.then(({icoAddress}) => {
		//         this.setState({ icoAddress })
		// 	})
		// 	.catch(error => {
		// TODO dont forget to add error display for user
		//         this.setState({ error: error.reason })
		// 		console.error('address generation failed', error)
		// 	})
		setTimeout(() => {
			this.setState({
				loading: false,
				transactions: []
			})
		}, 2000);
	}

	componentDidMount() {
		if (process.env.BROWSER) this.generateAddress()
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
		return 	<div id="buy_golos" className="row">

					{/* ACTUAL COMPONENT */}
					<div className="columns small-12">
						<h2>Макет функционала</h2>
						<hr />
					</div>

					<div className="columns small-12">
						<h2>ПОКУПКА СИЛЫ ГОЛОСА</h2>
                        {
                            state.error
                            ? <h1>{state.error}</h1>
                            : null
                        }
					</div>

					{/* GENERATE ADDRESS */}
					{
						props.isOwnAccount && (!state.icoAddress && !props.icoAddress)
						? 	<form className="columns small-12" onSubmit={this.generateAddress}>
								<div className="large-12 columns">
									<label htmlFor="checkbox1">
										<input id="checkbox1" type="checkbox" disabled={loading} required checked />
										Я прочитал и ознакомлен с условиями сообщества описанными в документе: <br />
										Голос: <a href="https://wiki.golos.io/1-introduction/golos_whitepaper.html">Русскоязычная социально-медийная блокчейн-платформа</a>
									</label>
									<label htmlFor="checkbox2">
										<input id="checkbox2" type="checkbox" disabled={loading} required checked />
										Я ознакомлен и принимаю условия <a href="/legal/sale_agreements.pdf">Договор купли-продажи токенов</a> "Голос"
									</label>
									<label htmlFor="checkbox3">
										<input id="checkbox3" type="checkbox" disabled={loading} required checked />
										Я ознакомлен с <a href="/legal/risk_disclosure.pdf">рисками</a>
									</label>
									<div className="column small-12 text-center">
										<input type="submit" className="button" value="Получить биткоин адрес" disabled={loading} />
									</div>
								</div>
							</form>
						: 	null
					}

					{/* ADDRESS + CURRENT STAGE INFO + QR CODE */}
					{
						state.icoAddress || props.icoAddress
						? <div className="row">
							<div className="column small-9 text-center">
								<h3><strong>{props.icoAddress || state.icoAddress}</strong></h3>
								<table>
									<thead>
										<tr>
											<th className="text-center" width="250">Максимальная Покупка</th>
											<th className="text-center" width="150">Текущий Бонус</th>
											<th className="text-center" width="100">До уменьшения бонуса</th>
										</tr>
									</thead>
									<tbody>
									<tr>
										<td>100 биткоинов</td>
										<td>25%</td>
										<td>25 дней 3 часа</td>
									</tr>
									</tbody>
								</table>
							</div>
							<div className="column small-3">
								<img src={`https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${props.icoAddress || state.icoAddress}`} alt="QR код вашего bitcoin адреса" />
							</div>
							<div className="column small-12">
								<p><b>Сила Голоса</b> - неперемещаемые цифровые токены. Их оценка в Голосах увеличивается при долгосрочном хранении. Чем их больше, тем сильней вы влияете на вознаграждения за пост и тем больше зарабатываете за голосование. Также Сила Голоса дает право записывать любые данные в блокчейн Голоса. Чем больше Силы Голоса, тем большая доля в пропускной способности гарантируется Вам сетью Голос. Перевод Силы Голоса в Голоса занимает 104 недели равными частями.</p>
								<p>Если у Вас нет биткоинов, то Вы можете их купить за любую национальную валюту на Localbitcoins.net. Также сообществом Голос организованы разные сервисы по участию в краудсейле. Инструкции по покупке можно найти по тэгу #КупитьБиткоин.</p>
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

					<div className="columns small-12">
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

					{/* TEST INFO */}
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
					</div>
				</div>
	}
}

export default connect(
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
	},
    dispatch => ({
		updateMeta: (operation) => {
			const options = {
				type: 'update_account_meta',
				operation
            }

			console.log(options)
			dispatch(transaction.actions.updateMeta(options)) //broadcastOperation


        },

    })
)(BuyGolos)
