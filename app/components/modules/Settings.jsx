import React from 'react';
// import {connect} from 'react-redux'
// import g from 'app/redux/GlobalReducer'
// import user from 'app/redux/User';
// import { translate } from 'app/Translator';
import { ALLOWED_CURRENCIES } from 'config/client_config'
import store from 'store';

export default class Settings extends React.Component {

    handleCurrencyChange(event) {
        store.set('currency', event.target.value)
    }

    render() {
        return <div className="Settings">
                    <div className="row">
                        <div className="column small-12 medium-8">
                            <br />
                        </div>
                    </div>
                    <div className="row">
                        {/* <div className="small-12 medium-6 columns">
                            <label>Выберите язык
                              <select>
                                <option value="ru">Русский</option>
                                <option value="en">Английский</option>
                              </select>
                            </label>
                        </div> */}
                        <div className="small-12 medium-6 columns">
                            <label>Выберите валюту
                                <select defaultValue={store.get('currency')} onChange={this.handleCurrencyChange}>
                                    {
                                        ALLOWED_CURRENCIES.map(i => {
                                            return <option key={i} value={i}>{i}</option>
                                        })
                                    }
                                </select>
                            </label>
                        </div>
                    </div>
                </div>
    }
}

// export default connect(
//     // mapStateToProps
//     (state, ownProps) => {
//         // let price_per_steem = undefined
//         const feed_price = state.global.get('feed_price')
//         // if(feed_price && feed_price.has('base') && feed_price.has('quote')) {
//         //     const {base, quote} = feed_price.toJS()
//         //     if(/ GBG/.test(base) && / GOLOS$/.test(quote))
//         //         price_per_steem = parseFloat(base.split(' ')[0])
//         // }
//         return {
//             ...ownProps,
//             // price_per_steem
//         }
//     },
//     // mapDispatchToProps
//     dispatch => ({
//         convertToSteem: (e) => {
//             e.preventDefault()
//             const name = 'convertToSteem'
//             dispatch(g.actions.showDialog({name}))
//         },
//         showChangePassword: (username) => {
//             const name = 'changePassword'
//             dispatch(g.actions.remove({key: name}))
//             dispatch(g.actions.showDialog({name, params: {username}}))
//         },
//     }),
    // dispatch => ({
    //     showLogin: e => {
    //         if (e) e.preventDefault();
    //         dispatch(user.actions.showLogin())
    //     },
    //     logout: e => {
    //         if (e) e.preventDefault();
    //         dispatch(user.actions.logout())
    //     },
    //     showSignUp: e => {
    //         if (e) e.preventDefault();
    //         dispatch(user.actions.showSignUp())
    //     }
    // })
// )(Settings)
