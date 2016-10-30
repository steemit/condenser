import React from 'react'
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
import {createTransaction, signTransaction} from 'shared/chain/transactions'

/*
	Логика компонента:
	Если пользователь находится на своей странице, и если у него нет Btc адреса, то должна отображаться форма ввода owner key. После ввода пароля, для пользователя генерируется адресс.
	Если у пользователя есть BTC адрес, то необходимо отразить аддрес, qr code и табличку с предыдущими транзакциями.
*/

function* updateMeta(accountName, meta, signingKey, onSuccess, onError) {
    // Be sure this account is up-to-date (other required fields are sent in the update)
    // const [account] = yield call([Apis, Apis.db_api], 'get_accounts', [accountName])

//    if (!account) {
  //      onError('Account not found')
    //    return
  //  }
    console.log("params", accountName, meta, signingKey, onSuccess, onError)
    if (!signingKey) {
        onError(`Incorrect Password`)
        throw new Error('Have to pass owner key in order to change meta')
    }

    try {
      const tx = yield createTransaction([
        ['update_account_meta', {
              account: accountName,
              json_metadata: meta,
          }]
      ])
      console.log("2");
      console.log(tx);

      const sx = signTransaction(tx, signingKey);
      console.log("2.5");
      yield new Promise((resolve, reject) =>
          Apis.broadcastTransaction(sx, () => {resolve()}).catch(e => {reject(e)})
      )
      console.log("3");
      if(onSuccess) onSuccess()
      console.log("4");
      // console.log('sign key.toPublicKey().toString()', key.toPublicKey().toString())
      // console.log('payload', payload)
    } catch(error) {
      console.error('Update meta', error)
      if(onError) onError(error)
    }
}

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
    loading: false,
	}

	generateAddress = once(
		function () {
			console.log('ouch! what happened?!  ')

			// some logic here
			//
			// set address in the end
			this.setState({ icoAddress: 'адрес не сгенерирован' })
	})
  testFormSubmit () {
			const success = (r) => {
					this.setState({loading: false, error: null})
					console.log(r)
					//const {onClose} = this.props
					//if(onClose) onClose()
					//if(resetForm) resetForm()
					// notify('Meta Updated')
					// window.location = window.location;
			}
			const error = (e) => {
					this.setState({loading: false, error: e})
					console.error(e);
					console.log('---')
			}
		console.log(this.icoAddress)
		console.log(this.props)
		console.log("is own: " + this.state.isOwnAccount)

		const k = document.getElementById('test-form-meta-value').value
		const v = document.getElementById('test-form-meta-value').value
		const p = document.getElementById('test-form-password').value
		const u = document.getElementById('test-form-usernmae').value
		let meta = o2j.ifStringParseJSON(this.props.metaData);
		meta[k] = v;
		meta = o2j.ifObjectToJSON(meta);
		this.setState({loading: true, error: null});
		let gen = updateMeta(u, meta, p, success, error); //TODO: !!! deal with generator in button click handler
    gen.next();
    gen.next();
    gen.next();

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
					</div>
					{
						props.isOwnAccount && !props.icoAddress
						? 	<form className="columns small-12">
								<label>
									Пожалуйста, введите главный пароль, чтобы сгенерировать адресс
									<br />
									<input id="meta-password" type="password" disabled={loading} />
								</label>
							</form>
						: null
					}
					{
						props.icoAddress
						? 	<div>
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
