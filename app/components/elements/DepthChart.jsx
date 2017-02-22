import React from 'react';
//import Highcharts from 'highcharts';
const ReactHighcharts = require("react-highcharts/dist/ReactHighstock");
import { translate } from 'app/Translator';
import { LIQUID_TOKEN_UPPERCASE, DEBT_TOKEN_SHORT, LIQUID_TICKER, CURRENCY_SIGN } from 'config/client_config';

//Highstock does not play well with decimal x values, so we need to
// multiply the x values by a constant factor and divide by this factor for
// display purposes (tooltip, x-axis)
const power = 100;
const precision = 1000;

function orderEqual(a, b) {
    return (
        a.price === b.price &&
        a.steem === b.steem &&
        a.sbd === b.sbd
    );
}

function ordersEqual(a, b) {
    if (a.length !== b.length) {
        return false;
    }

    for (let key in a) {
        if(!(key in b) || !orderEqual(a[key], b[key])) {
            return false;
        }
    }

    for (let key in b) {
        if(!(key in a) || !orderEqual(a[key], b[key])) {
            return false;
        }
    }

    return true;
}

class DepthChart extends React.Component {

    static propTypes = {
        bids: React.PropTypes.array,
        asks: React.PropTypes.array
    };

    shouldComponentUpdate(nextProps) {
        // Don't update if the orders are the same as last time
        if (ordersEqual(nextProps.bids, this.props.bids) && ordersEqual(nextProps.asks, this.props.asks)) {
            return false;
        }

        // Use HighCharts api once the chart has been initialized
        if (this.refs.depthChart) {
            // Only use the HighCharts api when both bids and asks already exist
            const chart = this.refs.depthChart.getChart();
            if (chart && "series" in chart && chart.series.length === 2) {
                const {bids, asks} = generateBidAsk(nextProps.bids, nextProps.asks);
                const {min, max} = getMinMax(bids, asks);

                chart.series[0].setData(bids);
                chart.series[1].setData(asks);
                chart.xAxis[0].setExtremes(min, max);
                return false;
            }
        }
        return true;
    }

    render() {
        const {bids, asks} = this.props;
        if (!bids.length && !asks.length) {
            return null;
        }
        const depth_chart_config = generateDepthChart(bids, asks);

        return (
            <div className="DepthChart"><ReactHighcharts ref="depthChart" config={depth_chart_config} /></div>
        );
    }
}

export default DepthChart;

function generateBidAsk(bidsArray, asksArray) {


    // Input raw orders (from TOP of order book DOWN), output grouped depth
    function aggregateOrders(orders) {
        if(typeof orders == 'undefined') {
          return [];
        }

        let ttl = 0
        return orders.map( o => {
            ttl += o.sbd;
            return [o.price * power, ttl]
        }).sort((a, b) => { // Sort here to make sure arrays are in the right direction for HighCharts
            return a[0] - b[0];
        });
    }

    let bids = aggregateOrders(bidsArray);
    // Insert a 0 entry to make sure the chart is centered properly
    bids.length && bids.unshift([0, bids[0][1]]);

    let asks = aggregateOrders(asksArray);
    // Insert a final entry to make sure the chart is centered properly
    asks.length && asks.push([asks[asks.length - 1][0] * 4, asks[asks.length - 1][1]]);

    return {bids, asks};
}

function getMinMax(bids, asks) {
    const highestBid = bids.length ? bids[bids.length-1][0] : 0;
    const lowestAsk = asks.length ? asks[0][0] : 1;

    const firstBid = bids.length ? bids[0][0] : 0;
    const lastAsk  = asks.length ? asks[asks.length-1][0] : 0;

    const middle = (highestBid + lowestAsk) / 2;

    return {
        min: Math.max(middle * 0.65, firstBid),
        max: Math.min(middle * 1.35, lastAsk)
    }
}

function generateDepthChart(bidsArray, asksArray) {

    const {bids, asks} = generateBidAsk(bidsArray, asksArray);
    let series = [];

    const {min, max} = getMinMax(bids, asks);

    if(process.env.BROWSER) {
        if(bids[0]) {
            series.push({step: 'right', name: translate('bid'), color: 'rgba(0,150,0,1.0)', fillColor: 'rgba(0,150,0,0.2)', tooltip: {valueSuffix: ' ' + LIQUID_TICKER},
             data:  bids})
        }
        if(asks[0]) {
            series.push({step: 'left', name: translate('ask'), color: 'rgba(150,0,0,1.0)', fillColor: 'rgba(150,0,0,0.2)', tooltip: {valueSuffix: ' ' + LIQUID_TICKER},
             data: asks})
        }
    }

    let depth_chart_config = {
        title:    {text: null},
        subtitle: {text: null},
        chart:    {type: 'area', zoomType: 'x'},
        xAxis:    {
            min: min,
            max: max,
            labels: {
                formatter: function() {return this.value / power;}
            },
            ordinal: false,
            lineColor: "#000000",
            title: {
                text: null
            }
        },
        yAxis:    {
            title: {text: null},
            lineWidth: 2,
            labels: {
                align: "left",
                formatter: function () {
                    let value = this.value / precision;
                    return '$' + (value > 10e6 ? (value / 10e6).toFixed(2) + "M" :
                        value > 10000 ? (value / 10e3).toFixed(2) + "k" :
                        value);
                }
            },
            gridLineWidth: 1,
        },
        legend:   {enabled: false},
        credits: {
            enabled: false
        },
        rangeSelector: {
            enabled: false
        },
        navigator: {
            enabled: false
        },
        scrollbar: {
            enabled: false
        },
        dataGrouping: {
            enabled: false
        },
        tooltip: {
            shared: false,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            formatter() {
                return `<span>${translate('price')}: ${(this.x / power).toFixed(6)} ${CURRENCY_SIGN}/${LIQUID_TOKEN_UPPERCASE}</span><br/><span>\u25CF</span>${this.series.name}: <b>${(this.y / 1000).toFixed(3)} ${DEBT_TOKEN_SHORT} ` + '(' + CURRENCY_SIGN + ')</b>';
            },
            style: {
                color: "#FFFFFF"
            }
        },
        plotOptions: {series: {animation: false}},
        series
    };
    //------------------------------
    return depth_chart_config;
}
