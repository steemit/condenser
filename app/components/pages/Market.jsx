import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
//import Highcharts from 'highcharts';

import transaction from 'app/redux/Transaction'
import TransactionError from 'app/components/elements/TransactionError'
import DepthChart from 'app/components/elements/DepthChart';
import Orderbook from "app/components/elements/Orderbook";
import OrderHistory from "app/components/elements/OrderHistory";
import {Order, TradeHistory} from "app/utils/MarketClasses";
import {roundUp, roundDown} from "app/utils/MarketUtils";

class Market extends React.Component {
    static propTypes = {
        orderbook: React.PropTypes.object,
        open_orders: React.PropTypes.array,
        ticker: React.PropTypes.object,
        // redux PropTypes
        placeOrder: React.PropTypes.func.isRequired,
        user: React.PropTypes.object,
    };

    shouldComponentUpdate = (nextProps, nextState) => {
      if( nextState.buy_disabled != this.state.buy_disabled ||
          nextState.sell_disabled != this.state.sell_disabled) {
          return true
      }

      if( nextState.buy_price_warning != this.state.buy_price_warning ||
          nextState.sell_price_warning != this.state.sell_price_warning) {
          return true
      }

      let tc = (typeof this.props.ticker == 'undefined') ||
          (this.props.ticker.latest !== nextProps.ticker.latest) ||
          (this.props.ticker.sbd_volume !== nextProps.ticker.sbd_volume)

      let bc = (typeof this.props.orderbook == 'undefined') ||
          (this.props.orderbook['asks'].length != nextProps.orderbook['asks'].length) ||
          (this.props.orderbook['bids'].length != nextProps.orderbook['bids'].length)

      let oc = (typeof nextProps.open_orders !== undefined) && (
          typeof this.props.open_orders == 'undefined' ||
          this.props.open_orders.length != nextProps.open_orders.length)

      // Update if ticker info changed, order book changed size, or open orders length changed.
      //if(tc || bc || oc) console.log("tc?", tc, "bc?", bc, "oc?", oc)
      return tc || bc || oc;
    }

    buySteem = (e) => {
        e.preventDefault()
        const {placeOrder, user} = this.props
        if(!user) return
        const owner = user.get('username')
        const amount_to_sell = parseFloat(ReactDOM.findDOMNode(this.refs.buySteem_total).value)
        const min_to_receive = parseFloat(ReactDOM.findDOMNode(this.refs.buySteem_amount).value)
        const price = (amount_to_sell / min_to_receive).toFixed(6)
        placeOrder(owner, amount_to_sell + " SBD", min_to_receive + " STEEM", "$" + price + "/STEEM", (msg) => {
            this.props.notify(msg)
            this.props.reload(owner)
        })
    }
    sellSteem = (e) => {
        e.preventDefault()
        const {placeOrder, user} = this.props
        if(!user) return
        const owner = user.get('username')
        const min_to_receive = parseFloat(ReactDOM.findDOMNode(this.refs.sellSteem_total).value)
        const amount_to_sell = parseFloat(ReactDOM.findDOMNode(this.refs.sellSteem_amount).value)
        const price = (min_to_receive / amount_to_sell).toFixed(6)
        placeOrder(owner, amount_to_sell + " STEEM", min_to_receive + " SBD", "$" + price + "/STEEM", (msg) => {
            this.props.notify(msg)
            this.props.reload(owner)
        })
    }
    cancelOrderClick = (e, orderid) => {
        e.preventDefault()
        const {cancelOrder, user} = this.props
        if(!user) return
        const owner = user.get('username')
        cancelOrder(owner, orderid, (msg) => {
            this.props.notify(msg)
            this.props.reload(owner)
        })
    }

    setFormPrice = (price) => {
        const p = parseFloat(price)

        this.refs.sellSteem_price.value = p.toFixed(6)
        this.refs.buySteem_price.value  = p.toFixed(6)

        const samount = parseFloat(this.refs.sellSteem_amount.value)
        if(samount >= 0) this.refs.sellSteem_total.value = roundDown(p * samount, 3)

        const bamount = parseFloat(this.refs.buySteem_amount.value)
        if(bamount >= 0) this.refs.buySteem_total.value = roundUp(p * bamount, 3)

        this.validateBuySteem()
        this.validateSellSteem()
    }

    percentDiff = (a, b) => {
        console.log(200 * Math.abs(a - b) / (a + b))
        return 200 * Math.abs(a - b) / (a + b)
    }

    validateBuySteem = () => {
        const amount = parseFloat(this.refs.buySteem_amount.value)
        const price = parseFloat(this.refs.buySteem_price.value)
        const total = parseFloat(this.refs.buySteem_total.value)
        const valid = (amount > 0 && price > 0 && total > 0)
        this.setState({buy_disabled: !valid, buy_price_warning: valid && this.percentDiff(total/amount, price) > 1 });
    }

    validateSellSteem = () => {
        const amount = parseFloat(this.refs.sellSteem_amount.value)
        const price = parseFloat(this.refs.sellSteem_price.value)
        const total = parseFloat(this.refs.sellSteem_total.value)
        const valid = (amount > 0 && price > 0 && total > 0)
        this.setState({sell_disabled: !valid, sell_price_warning: valid && this.percentDiff(total/amount, price) > 1 });
    }

    constructor(props) {
        super(props);
        this.state = {
            buy_disabled: true,
            sell_disabled: true,
            buy_price_warning: false,
            sell_price_warning: false,
        };
    }


    render() {
        const {sellSteem, buySteem, cancelOrderClick, setFormPrice,
               validateBuySteem, validateSellSteem} = this
        const {buy_disabled, sell_disabled,
               buy_price_warning, sell_price_warning} = this.state

        let ticker = {
            latest:         0,
            lowest_ask:     0,
            highest_bid:    0,
            percent_change: 0,
            sbd_volume:     0,
            feed_price:     0}

        if(typeof this.props.ticker != 'undefined') {
            let {latest, lowest_ask, highest_bid, percent_change, sbd_volume} = this.props.ticker;
            let {base, quote} = this.props.feed
            ticker = {
                latest:         parseFloat(latest),
                lowest_ask:     roundUp(parseFloat(lowest_ask), 6),
                highest_bid:    roundDown(parseFloat(highest_bid), 6),
                percent_change: parseFloat(percent_change),
                sbd_volume:     (parseFloat(sbd_volume)),
                feed_price:     parseFloat(base.split(' ')[0]) / parseFloat(quote.split(' ')[0])
            }
        }


        // Take raw orders from API and put them into a format that's clean & useful
        function normalizeOrders(orders) {
            if(typeof orders == 'undefined') return {'bids': [], 'asks': []}
            return ['bids', 'asks'].reduce( (out, side) => {
                out[side] = orders[side].map( o => {
                    return new Order(o, side);
                });
                return out;
            }, {})
        }

        function aggOrders(orders) {
            return ['bids', 'asks'].reduce( (out, side) => {

                var buff = [], last = null
                orders[side].map( o => {
                    // o.price = (side == 'asks') ? roundUp(o.price, 6) : Math.max(roundDown(o.price, 6), 0.000001)
                    // the following line should be checking o.price == last.price but it appears due to inverted prices from API,
                    //   inverting again causes values to not be properly sorted.
                    if(last !== null && o.getStringPrice() === last.getStringPrice()) {
                    //if(last !== null && o.price == last.price) {
                        buff[buff.length-1] = buff[buff.length-1].add(o);
                        // buff[buff.length-1].steem += o.steem
                        // buff[buff.length-1].sbd   += o.sbd
                        // buff[buff.length-1].sbd_depth = o.sbd_depth
                        // buff[buff.length-1].steem_depth = o.steem_depth
                    } else {
                        buff.push(o)
                    }
                    last = o
                });

                out[side] = buff
                return out
            }, {})
        }

        let account     = this.props.account
        let open_orders = this.props.open_orders;
        let orderbook   = aggOrders(normalizeOrders(this.props.orderbook));

        // ORDERBOOK TABLE GENERATOR
        // function table(orderbook, side = 'bids', callback = ((price,steem,sbd) => {})) {
        //
        //     let rows = orderbook[side].slice(0, 25).map( (o,i) =>
        //         <OrderbookRow side={side} onClick={e => {callback( o.price, o.steem_depth, o.sbd_depth) }} />
        //     );
        //
        //     return
        // }


        function normalizeOpenOrders(open_orders) {
            return open_orders.map( o => {
                const type = o.sell_price.base.indexOf('STEEM') > 0 ? 'ask' : 'bid'
                //{orderid: o.orderid,
                // created: o.created,
                return {...o,
                 type:    type,
                 price:   parseFloat(type == 'ask' ? o.real_price : o.real_price),
                 steem:   type == 'ask' ? o.sell_price.base : o.sell_price.quote,
                 sbd:     type == 'bid' ? o.sell_price.base : o.sell_price.quote}

            })
        }

        // Logged-in user's open orders
        function open_orders_table(open_orders) {
            const rows = open_orders && normalizeOpenOrders(open_orders).map( o =>
              <tr key={o.orderid}>
                  <td>{o.created.replace('T', ' ')}</td>
                  <td>{o.type == 'ask' ? 'Sell' : 'Buy'}</td>
                  <td>${o.price.toFixed(6)}</td>
                  <td>{o.steem}</td>
                  <td>{o.sbd.replace('SBD', 'SD')}</td>
                  <td><a href="#" onClick={e => cancelOrderClick(e, o.orderid)}>Cancel</a></td>
              </tr> )

            return <table className="Market__open-orders">
                <thead>
                    <tr>
                        <th>Date Created</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th>STEEM</th>
                        <th>SD ($)</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        }


        function trade_history_table(trades) {
            if (!trades || !trades.length) {
                return [];
            }
            const norm = (trades) => {return trades.map( t => {
                return new TradeHistory(t);
            } )}

            return <OrderHistory history={norm(trades)} />
        }

        const pct_change = <span className={'Market__ticker-pct-' + (ticker.percent_change < 0 ? 'down' : 'up')}>
                {ticker.percent_change < 0 ? '' : '+'}{ticker.percent_change.toFixed(2)}%
              </span>

        return (
            <div>
                <div className="row">
                    <div className="column">
                        <ul className="Market__ticker">
                            <li><b>Last price</b> ${ticker.latest.toFixed(6)} ({pct_change})</li>
                            <li><b>24h volume</b> ${ticker.sbd_volume.toFixed(2)}</li>
                            <li><b>Bid</b> ${ticker.highest_bid.toFixed(6)}</li>
                            <li><b>Ask</b> ${ticker.lowest_ask.toFixed(6)}</li>
                            {ticker.highest_bid > 0 &&
                                <li><b>Spread</b> {(200 * (ticker.lowest_ask - ticker.highest_bid) / (ticker.highest_bid + ticker.lowest_ask)).toFixed(3)}%</li>}
                            {/*<li><b>Feed price</b> ${ticker.feed_price.toFixed(3)}</li>*/}
                        </ul>
                    </div>
                </div>

                <div className="row">
                    <div className="column">
                        <DepthChart bids={orderbook.bids} asks={orderbook.asks} />
                    </div>
                </div>

                <div className="row">
                    <div className="column">
                        <TransactionError opType="limit_order_create" />
                    </div>
                </div>

                <div className="row">
                    <div className="small-12 medium-6 columns">
                        <h4 className="buy-color">BUY STEEM</h4>
                        <form className="Market__orderform" onSubmit={buySteem}>

                            <div className="row">
                                <div className="column small-3 large-2">
                                    <label>Price</label>
                                </div>
                                <div className="column small-9 large-8">
                                    <div className="input-group">
                                        <input className={'input-group-field' + (buy_price_warning ? ' price_warning' : '')} type="text" 
                                          ref="buySteem_price" placeholder="0.0" onChange={e => {
                                            const amount = parseFloat(this.refs.buySteem_amount.value)
                                            const price  = parseFloat(this.refs.buySteem_price.value)
                                            if(amount >= 0 && price >= 0) this.refs.buySteem_total.value = roundUp(price * amount, 3)
                                            validateBuySteem()
                                        }} />
                                        <span className="input-group-label">SD/STEEM</span>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="column small-3 large-2">
                                    <label>Amount</label>
                                </div>
                                <div className="column small-9 large-8">
                                    <div className="input-group">
                                        <input className="input-group-field" type="text" ref="buySteem_amount" placeholder="0.0" onChange={e => {
                                            const price = parseFloat(this.refs.buySteem_price.value)
                                            const amount = parseFloat(this.refs.buySteem_amount.value)
                                            if(price >= 0 && amount >= 0) this.refs.buySteem_total.value = roundUp(price * amount, 3)
                                            validateBuySteem()
                                        }} />
                                        <span className="input-group-label">STEEM</span>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="column small-3 large-2">
                                    <label>Total</label>
                                </div>
                                <div className="column small-9 large-8">
                                    <div className="input-group">
                                        <input className="input-group-field" type="text" ref="buySteem_total" placeholder="0.0" onChange={e => {
                                            const price = parseFloat(this.refs.buySteem_price.value)
                                            const total = parseFloat(this.refs.buySteem_total.value)
                                            if(total >= 0 && price >= 0) this.refs.buySteem_amount.value = roundUp(total / price, 3)
                                            validateBuySteem()
                                        }} />
                                        <span className="input-group-label">SD ($)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="column small-3 large-2">
                                </div>
                                <div className="column small-9 large-8">
                                    <input disabled={buy_disabled} type="submit" className="button hollow buy-color float-right" value="BUY STEEM" />
                                    {account &&
                                    <div><small>
                                        <a href="#" onClick={e => {
                                                e.preventDefault();
                                                const price = parseFloat(this.refs.buySteem_price.value)
                                                const total = account.sbd_balance.split(' ')[0]
                                                this.refs.buySteem_total.value = total
                                                if(price >= 0) this.refs.buySteem_amount.value = roundDown(parseFloat(total) / price, 3).toFixed(3)
                                                validateBuySteem()
                                            }}>Available:</a> {account.sbd_balance.replace('SBD', 'SD')}
                                    </small></div>}

                                    <div><small>
                                        <a href="#" onClick={e => {
                                            e.preventDefault();
                                            const amount = parseFloat(this.refs.buySteem_amount.value)
                                            const price = parseFloat(ticker.lowest_ask)
                                            this.refs.buySteem_price.value = ticker.lowest_ask
                                            if(amount >= 0) this.refs.buySteem_total.value = roundUp(amount * price, 3).toFixed(3)
                                            validateBuySteem()
                                        }}>Lowest ask:</a> {ticker.lowest_ask.toFixed(6)}
                                    </small></div>
                                </div>
                            </div>
                        </form>

                    </div>


                    <div className="small-12 medium-6 columns">
                        <h4 className="sell-color">SELL STEEM</h4>

                        <form className="Market__orderform" onSubmit={sellSteem}>
                            <div className="row">
                                <div className="column small-3 large-2">
                                    <label>Price</label>
                                </div>
                                <div className="column small-9 large-8">
                                    <div className="input-group">
                                        <input className={'input-group-field' + (sell_price_warning ? ' price_warning' : '')} type="text" 
                                          ref="sellSteem_price" placeholder="0.0" onChange={e => {
                                          const amount = parseFloat(this.refs.sellSteem_amount.value)
                                          const price  = parseFloat(this.refs.sellSteem_price.value)
                                          if(amount >= 0 && price >= 0) this.refs.sellSteem_total.value = roundDown(price * amount, 3)
                                          validateSellSteem()
                                        }} />
                                        <span className="input-group-label">SD/STEEM</span>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="column small-3 large-2">
                                    <label>Amount</label>
                                </div>
                                <div className="column small-9 large-8">
                                    <div className="input-group">
                                        <input className="input-group-field" type="text" ref="sellSteem_amount" placeholder="0.0" onChange={e => {
                                          const price  = parseFloat(this.refs.sellSteem_price.value)
                                          const amount = parseFloat(this.refs.sellSteem_amount.value)
                                          if(price >= 0 && amount >= 0) this.refs.sellSteem_total.value = roundDown(price * amount, 3)
                                          validateSellSteem()
                                        }} />
                                        <span className="input-group-label">STEEM</span>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="column small-3 large-2">
                                    <label>Total</label>
                                </div>
                                <div className="column small-9 large-8">
                                    <div className="input-group">
                                      <input className="input-group-field" type="text" ref="sellSteem_total" placeholder="0.0" onChange={e => {
                                          const price = parseFloat(this.refs.sellSteem_price.value)
                                          const total = parseFloat(this.refs.sellSteem_total.value)
                                          if(price >= 0 && total >= 0) this.refs.sellSteem_amount.value = roundUp(total / price, 3)
                                          validateSellSteem()
                                      }} />
                                      <span className="input-group-label">SD ($)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="column small-3 large-2"></div>
                                <div className="column small-9 large-8">
                                    <input disabled={sell_disabled} type="submit" className="button hollow sell-color float-right" value="SELL STEEM" />
                                    {account &&
                                        <div><small><a href="#" onClick={e => {e.preventDefault()
                                            const price = parseFloat(this.refs.sellSteem_price.value)
                                            const amount = account.balance.split(' ')[0]
                                            this.refs.sellSteem_amount.value = amount
                                            if(price >= 0) this.refs.sellSteem_total.value = roundDown(price * parseFloat(amount), 3)
                                            validateSellSteem()
                                        }}>Available:</a> {account.balance}</small></div>}
                                    <div><small><a href="#" onClick={e => {e.preventDefault()
                                        const amount = parseFloat(this.refs.sellSteem_amount.value)
                                        const price = ticker.highest_bid
                                        this.refs.sellSteem_price.value = price
                                        if(amount >= 0) this.refs.sellSteem_total.value = roundDown(parseFloat(price) * amount, 3)
                                        validateSellSteem()
                                    }}>Highest bid:</a> {ticker.highest_bid.toFixed(6)}</small></div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="row show-for-medium">

                    <div className="small-12 medium-6 large-4 columns">
                        <h4>Buy Orders</h4>
                        <Orderbook
                            side={"bids"}
                            orders={orderbook.bids}
                            onClick={(price) => {
                                setFormPrice(price)
                            }}
                        />
                    </div>

                    <div className="small-12 medium-6 large-4 columns">
                        <h4>Sell Orders</h4>
                        <Orderbook
                            side={"asks"}
                            orders={orderbook.asks}
                            onClick={(price) => {
                                setFormPrice(price)
                            }}
                        />
                    </div>

                    <div className="small-12 large-4 column">
                        <h4>Trade History</h4>
                        {trade_history_table(this.props.history)}
                    </div>
                </div>

                {account &&
                    <div className="row">
                        <div className="column">
                            <h4>Open Orders</h4>
                            {open_orders_table(open_orders)}
                        </div>
                    </div>}

            </div>
        );
    }
}
const DEFAULT_EXPIRE = 0xFFFFFFFF//Math.floor((Date.now() / 1000) + (60 * 60 * 24)) // 24 hours
module.exports = {
    path: 'market',
    component: connect(state => ({
        orderbook:   state.market.get('orderbook'),
        open_orders: process.env.BROWSER ? state.market.get('open_orders') : [],
        ticker:      state.market.get('ticker'),
        account:     state.market.get('account'),
        history:     state.market.get('history'),
        user:        state.user.get('current'),
        feed:        state.global.get('feed_price').toJS()
    }),
    dispatch => ({
        notify: (message) => {
            dispatch({type: 'ADD_NOTIFICATION', payload:
                {key: "mkt_" + Date.now(),
                 message: message,
                 dismissAfter: 5000}
            });
        },
        reload: (username) => {
          console.log("Reload market state...")
          dispatch({type: 'market/UPDATE_MARKET', payload: {username: username}})
        },
        cancelOrder: (owner, orderid, successCallback) => {
            const confirm = `Cancel order #${orderid} from ${owner}?`
            const successMessage = `Order #${orderid} cancelled.`
            dispatch(transaction.actions.broadcastOperation({
                type: 'limit_order_cancel',
                operation: {owner, orderid/*, __config: {successMessage}*/},
                confirm,
                successCallback: () => {successCallback(successMessage);}
                //successCallback
            }))
        },
        placeOrder: (owner, amount_to_sell, min_to_receive, effectivePrice, successCallback, fill_or_kill = false, expiration = DEFAULT_EXPIRE) => {
            // create_order jsc 12345 "1.000 SBD" "100.000 STEEM" true 1467122240 false

            // Padd amounts to 3 decimal places
            amount_to_sell = amount_to_sell.replace(amount_to_sell.split(' ')[0],
                String(parseFloat(amount_to_sell).toFixed(3)))
            min_to_receive = min_to_receive.replace(min_to_receive.split(' ')[0],
                String(parseFloat(min_to_receive).toFixed(3)))

            const confirmStr = /STEEM$/.test(amount_to_sell) ?
                `Sell ${amount_to_sell} for at least ${min_to_receive} (${effectivePrice})` :
                `Buy at least ${min_to_receive} for ${amount_to_sell} (${effectivePrice})`
            const successMessage = `Order placed: ${confirmStr}`
            const confirm = confirmStr + '?'
            const orderid = Math.floor(Date.now() / 1000)
            dispatch(transaction.actions.broadcastOperation({
                type: 'limit_order_create',
                operation: {owner, amount_to_sell, min_to_receive, fill_or_kill, expiration, orderid}, //,
                    //__config: {successMessage}},
                confirm,
                successCallback: () => {successCallback(successMessage);}
            }))
        }
    })
    )(Market)
};
