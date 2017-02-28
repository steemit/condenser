import React from "react";
import HistoryRow from "./OrderhistoryRow.jsx";
import { translate } from 'app/Translator';
import { DEBT_TOKEN_SHORT, LIQUID_TOKEN } from 'config/client_config';

export default class OrderHistory extends React.Component {

    constructor() {
        super();

        this.state = {
            historyIndex: 0,
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

    renderHistoryRows(history, buy) {
        if (!history.length) {
            return null;
        }

        let {historyIndex} = this.state;

        return history.map((order, index) => {
            if (index >= historyIndex && index < (historyIndex + 10)) {
                return (
                    <HistoryRow
                        key={order.date.getTime() + order.getStringPrice() + order.getStringSBD()}
                        index={index}
                        order={order}
                        animate={this.state.animate}
                    />
                );
            }
        }).filter(a => {
            return !!a;
        });
    }

    _setHistoryPage(back) {
        let newState = {};
        const newIndex = this.state.historyIndex + (back ? 10 : -10);
        newState.historyIndex = Math.min(Math.max(0, newIndex), this.props.history.length - 10);

        // Disable animations while paging
        if (newIndex !== this.state.historyIndex) {
            newState.animate = false;
        }
        // Reenable animatons after paging complete
        this.setState(newState, () => {
            this.setState({animate: true})
        });
    }

    render() {
        const {history} = this.props;
        const {historyIndex} = this.state;

        return (
            <section>
                <table className="Market__trade-history">
                    <thead>
                        <tr>
                            <th>{translate('date')}</th>
                            <th>{translate('price')}</th>
                            <th>{LIQUID_TOKEN}</th>
                            <th>{DEBT_TOKEN_SHORT}</th>
                        </tr>
                    </thead>
                    <tbody>
                            {this.renderHistoryRows(history)}
                    </tbody>
                </table>

                <nav>
                  <ul className="pager">
                    <li>
                        <div className={"button tiny hollow float-left " + (historyIndex === 0 ? " disabled" : "")}  onClick={this._setHistoryPage.bind(this, false)} aria-label="Previous">
                            <span aria-hidden="true">&larr; {translate('newer')}</span>
                        </div>
                    </li>
                    <li>
                        <div className={"button tiny hollow float-right " + (historyIndex >= (history.length - 10) ? " disabled" : "")}  onClick={this._setHistoryPage.bind(this, true)} aria-label="Next">
                            <span aria-hidden="true">{translate('older')} &rarr;</span>
                        </div>
                    </li>
                  </ul>
                </nav>
            </section>

        )
    }

}
