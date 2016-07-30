import React from "react";
import OrderbookRow from "./OrderbookRow";

export default class Orderbook extends React.Component {

    constructor() {
        super();

        this.state = {
            buyIndex: 0,
            sellIndex: 0,
            animate: false
        }
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({
            animate: true
            });
        }, 2000);
    }

    _setBuySellPage(back) {

        const indexKey = this.props.side === "bids" ? "buyIndex" : "sellIndex";

        let newIndex = this.state[indexKey] + (back ? 10 : -10);

        newIndex = Math.min(Math.max(0, newIndex), this.props.orders.length - 10);

        let newState = {};
        newState[indexKey] = newIndex;
        // Disable animations while paging
        if (newIndex !== this.state[indexKey]) {
            newState.animate = false;
        }
        // Reenable animatons after paging complete
        this.setState(newState, () => {
            this.setState({animate: true})
        });
    }

    renderBuySellHeader() {
        let buy = this.props.side === "bids";

        return (
            <thead>
                <tr>
                    <th>{buy ? "Total SD ($)" : "Price"}</th>
                    <th>{buy ? "SD ($)" : "Steem"}</th>
                    <th>{buy ? "Steem" : "SD ($)"}</th>
                    <th>{buy ? "Price" : "Total SD ($)"}</th>
                </tr>
            </thead>
        );
    }

    renderOrdersRows() {
        const {orders, side} = this.props;
        const buy = side === "bids";

        if (!orders.length) {
            return null;
        }
        const {buyIndex, sellIndex} = this.state;

        let total = 0;
        return orders
        .map((order, index) => {
            total += order.getSBDAmount();
            if (index >= (buy ? buyIndex : sellIndex) && index < ((buy ? buyIndex : sellIndex) + 10)) {
                return (
                    <OrderbookRow
                        onClick={this.props.onClick}
                        animate={this.state.animate}
                        key={side + order.getStringSBD() + order.getStringPrice()}
                        index={index}
                        order={order}
                        side={side}
                        total={total}
                    />
                );
            }
            return null;
        }).filter(a => {
            return !!a;
        });
    }

    render() {
        const {orders} = this.props;
        const buy = this.props.side === "bids";
        const {buyIndex, sellIndex} = this.state;

        const currentIndex = buy ? buyIndex : sellIndex;

        return (
            <div>
                <table className="Market__orderbook">
                    {this.renderBuySellHeader()}
                    <tbody>
                            {this.renderOrdersRows()}
                    </tbody>
                </table>
                <nav>
                  <ul className="pager">
                    <li>
                        <div className={"button tiny hollow " + (buy ? "float-left" : "float-left") + (currentIndex === 0 ? " disabled" : "")} onClick={this._setBuySellPage.bind(this, false)} aria-label="Previous">
                            <span aria-hidden="true">&larr; {buy ? "Higher" : "Lower"}</span>
                        </div>
                    </li>
                    <li>
                        <div className={"button tiny hollow " + (buy ? "float-right" : "float-right") + (currentIndex >= (orders.length - 10) ? " disabled" : "")} onClick={this._setBuySellPage.bind(this, true)} aria-label="Next">
                            <span aria-hidden="true">{buy ? "Lower" : "Higher"} &rarr;</span>
                        </div>
                    </li>
                  </ul>
                </nav>
            </div>

        )
    }
}
