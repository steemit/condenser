import {roundDown, roundUp} from "./MarketUtils";
import { LIQUID_TICKER, DEBT_TICKER } from 'config/client_config'
const precision = 1000;

class Order {
    constructor(order, side) {
        this.side = side;
        this.price = parseFloat(order.real_price);
        this.price = side === 'asks' ? roundUp(this.price, 6) : Math.max(roundDown(this.price, 6), 0.000001);
        this.stringPrice = this.price.toFixed(6);
        this.steem = parseInt(order.steem, 10);
        this.sbd = parseInt(order.sbd, 10);
        this.date = order.created;
    }

    getSteemAmount() {
        return this.steem / precision;
    }

    getStringSteem() {
        return this.getSteemAmount().toFixed(3);
    }

    getPrice() {
        return this.price;
    }

    getStringPrice() {
        return this.stringPrice;
    }

    getStringSBD() {
        return this.getSBDAmount().toFixed(3);
    }

    getSBDAmount() {
        return this.sbd / precision;
    }

    add(order) {
        return new Order({
            real_price: this.price,
            steem: this.steem + order.steem,
            sbd: this.sbd + order.sbd,
            date: this.date
        }, this.type);
    }

    equals(order) {
        return (
            this.getStringSBD() === order.getStringSBD() &&
            this.getStringSteem() === order.getStringSteem() &&
            this.getStringPrice() === order.getStringPrice()
        );
    }
}

class TradeHistory {

    constructor(fill) {
        // Norm date (FF bug)
        var zdate = fill.date;
        if(!/Z$/.test(zdate))
          zdate = zdate + 'Z'

        this.date = new Date(zdate);
        this.type = fill.current_pays.indexOf(DEBT_TICKER) !== -1 ? "bid" : "ask";
        this.color = this.type == "bid" ? "buy-color" : "sell-color";
        if (this.type === "bid") {
            this.sbd = parseFloat(fill.current_pays.split(" " + DEBT_TICKER)[0]);
            this.steem = parseFloat(fill.open_pays.split(" " + LIQUID_TICKER)[0]);
        } else {
            this.sbd = parseFloat(fill.open_pays.split(" " + DEBT_TICKER)[0]);
            this.steem = parseFloat(fill.current_pays.split(" " + LIQUID_TICKER)[0]);
        }

        this.price = this.sbd / this.steem;
        this.price = this.type === 'ask' ? roundUp(this.price, 6) : Math.max(roundDown(this.price, 6), 0.000001);
        this.stringPrice = this.price.toFixed(6);
    }

    getSteemAmount() {
        return this.steem;
    }

    getStringSteem() {
        return this.getSteemAmount().toFixed(3);
    }

    getSBDAmount() {
        return this.sbd;
    }

    getStringSBD() {
        return this.getSBDAmount().toFixed(3);
    }

    getPrice() {
        return this.price;
    }

    getStringPrice() {
        return this.stringPrice;
    }

    equals(order) {
        return (
            this.getStringSBD() === order.getStringSBD() &&
            this.getStringSteem() === order.getStringSteem() &&
            this.getStringPrice() === order.getStringPrice()
        );
    }
}

module.exports = {
    Order,
    TradeHistory
}
