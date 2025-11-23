'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _class, _temp; /* eslint-disable space-before-function-paren */
/* eslint-disable no-continue */
/* eslint-disable no-plusplus */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-underscore-dangle */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-constant-condition */
/* eslint-disable no-mixed-operators */
/* eslint-disable no-unused-expressions */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-undef */


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _reactRangeslider = require('react-rangeslider');

var _reactRangeslider2 = _interopRequireDefault(_reactRangeslider);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _CloseButton = require('app/components/elements/CloseButton');

var _CloseButton2 = _interopRequireDefault(_CloseButton);

var _TransactionReducer = require('app/redux/TransactionReducer');

var transactionActions = _interopRequireWildcard(_TransactionReducer);

var _Icon = require('app/components/elements/Icon');

var _Icon2 = _interopRequireDefault(_Icon);

var _client_config = require('app/client_config');

var _FormattedAsset = require('app/components/elements/FormattedAsset');

var _FormattedAsset2 = _interopRequireDefault(_FormattedAsset);

var _StateFunctions = require('app/utils/StateFunctions');

var _shouldComponentUpdate = require('app/utils/shouldComponentUpdate');

var _shouldComponentUpdate2 = _interopRequireDefault(_shouldComponentUpdate);

var _ParsersAndFormatters = require('app/utils/ParsersAndFormatters');

var _DropdownMenu = require('app/components/elements/DropdownMenu');

var _DropdownMenu2 = _interopRequireDefault(_DropdownMenu);

var _TimeAgoWrapper = require('app/components/elements/TimeAgoWrapper');

var _TimeAgoWrapper2 = _interopRequireDefault(_TimeAgoWrapper);

var _Dropdown = require('app/components/elements/Dropdown');

var _Dropdown2 = _interopRequireDefault(_Dropdown);

var _ServerApiClient = require('app/utils/ServerApiClient');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ABOUT_FLAG = _react2.default.createElement(
    'div',
    null,
    _react2.default.createElement(
        'p',
        null,
        'Downvoting a post can decrease pending rewards and make it less visible. Common reasons:'
    ),
    _react2.default.createElement(
        'ul',
        null,
        _react2.default.createElement(
            'li',
            null,
            'Disagreement on rewards'
        ),
        _react2.default.createElement(
            'li',
            null,
            'Fraud or plagiarism'
        ),
        _react2.default.createElement(
            'li',
            null,
            'Hate speech or trolling'
        ),
        _react2.default.createElement(
            'li',
            null,
            'Miscategorized content or spam'
        )
    )
);

var MAX_VOTES_DISPLAY = 20;
var VOTE_WEIGHT_DROPDOWN_THRESHOLD = 1.0 * 1000.0 * 1000.0;
var SBD_PRINT_RATE_MAX = 10000;
var MAX_WEIGHT = 10000;
var MIN_PAYOUT = 0.02;

function amt(string_amount) {
    return (0, _ParsersAndFormatters.parsePayoutAmount)(string_amount);
}

function fmt(decimal_amount) {
    var asset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    return (0, _ParsersAndFormatters.formatDecimal)(decimal_amount).join('') + (asset ? ' ' + asset : '');
}

function abs(value) {
    return Math.abs(parseInt(value));
}

var Voting = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(Voting, _React$Component);

    function Voting(props) {
        (0, _classCallCheck3.default)(this, Voting);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Voting.__proto__ || (0, _getPrototypeOf2.default)(Voting)).call(this, props));

        _this.state = {
            showWeight: false,
            sliderWeight: {
                up: MAX_WEIGHT,
                down: MAX_WEIGHT
            }
        };

        _this.voteUp = function (e) {
            e && e.preventDefault();
            _this.voteUpOrDown(true);
        };
        _this.voteDown = function (e) {
            e && e.preventDefault();
            _this.voteUpOrDown(false);
        };
        _this.voteUpOrDown = function (up) {
            if (_this.props.voting) return;
            _this.setState({ votingUp: up, votingDown: !up });
            if (_this.state.showWeight) _this.setState({ showWeight: false });
            var _this$props = _this.props,
                myVote = _this$props.myVote,
                author = _this$props.author,
                permlink = _this$props.permlink,
                username = _this$props.username,
                is_comment = _this$props.is_comment;


            var weight = void 0;
            if (myVote > 0 || myVote < 0) {
                // if there is a current vote, we're clearing it
                weight = 0;
            } else if (_this.props.enable_slider) {
                // if slider is enabled, read its value
                weight = up ? _this.state.sliderWeight.up : -_this.state.sliderWeight.down;
            } else {
                // otherwise, use max power
                weight = up ? MAX_WEIGHT : -MAX_WEIGHT;
            }

            var rshares = Math.floor(0.05 * _this.props.net_vests * 1e6 * (weight / 10000.0));
            var isFlag = up ? null : true;
            _this.props.vote(weight, {
                author: author,
                permlink: permlink,
                username: username,
                myVote: myVote,
                isFlag: isFlag,
                rshares: rshares
            });
        };

        _this.handleWeightChange = function (up) {
            return function (weight) {
                var w = void 0;
                if (up) {
                    w = {
                        up: weight,
                        down: _this.state.sliderWeight.down
                    };
                } else {
                    w = {
                        up: _this.state.sliderWeight.up,
                        down: weight
                    };
                }
                _this.setState({ sliderWeight: w });
            };
        };

        _this.storeSliderWeight = function (up) {
            return function () {
                var _this$props2 = _this.props,
                    username = _this$props2.username,
                    is_comment = _this$props2.is_comment;

                var weight = up ? _this.state.sliderWeight.up : _this.state.sliderWeight.down;
                localStorage.setItem('voteWeight' + (up ? '' : 'Down') + '-' + username + (is_comment ? '-comment' : ''), weight);
            };
        };
        _this.readSliderWeight = function () {
            var _this$props3 = _this.props,
                username = _this$props3.username,
                enable_slider = _this$props3.enable_slider,
                is_comment = _this$props3.is_comment;

            if (enable_slider) {
                var sliderWeightUp = Number(localStorage.getItem('voteWeight' + '-' + username + (is_comment ? '-comment' : '')));
                var sliderWeightDown = Number(localStorage.getItem('voteWeight' + 'Down' + '-' + username + (is_comment ? '-comment' : '')));
                _this.setState({
                    sliderWeight: {
                        up: sliderWeightUp ? sliderWeightUp : MAX_WEIGHT,
                        down: sliderWeightDown ? sliderWeightDown : MAX_WEIGHT
                    }
                });
            }
        };

        _this.toggleWeightUp = function (e) {
            e.preventDefault();
            _this.toggleWeightUpOrDown(true);
        };

        _this.toggleWeightDown = function (e) {
            e && e.preventDefault();
            _this.toggleWeightUpOrDown(false);
        };

        _this.toggleWeightUpOrDown = function (up) {
            _this.setState({
                showWeight: !_this.state.showWeight,
                showWeightDir: up ? 'up' : 'down'
            });
        };
        _this.shouldComponentUpdate = (0, _shouldComponentUpdate2.default)(_this, 'Voting');
        return _this;
    }

    (0, _createClass3.default)(Voting, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                myVote = _props.myVote,
                active_votes = _props.active_votes,
                showList = _props.showList,
                voting = _props.voting,
                enable_slider = _props.enable_slider,
                is_comment = _props.is_comment,
                post = _props.post,
                price_per_steem = _props.price_per_steem,
                sbd_print_rate = _props.sbd_print_rate,
                username = _props.username,
                vests_per_steem = _props.vests_per_steem,
                vests_per_trx = _props.vests_per_trx,
                tron_market_price = _props.tron_market_price,
                tron_price_tronscan = _props.tron_price_tronscan;


            var trx_price = tron_market_price && tron_market_price.get(0) && tron_market_price.get(0).has('price_usd') ? parseFloat(tron_market_price.get(0).get('price_usd')) : 0.0;
            if (trx_price == 0) {
                trx_price = tron_price_tronscan;
            }

            // `lite` Voting component: e.g. search results
            if (!post.get('pending_payout_value')) {
                return _react2.default.createElement(
                    'span',
                    { className: 'Voting' },
                    _react2.default.createElement(
                        'span',
                        { className: 'Voting__inner' },
                        _react2.default.createElement(_FormattedAsset2.default, {
                            amount: post.get('payout'),
                            asset: '$',
                            classname: ''
                        })
                    )
                );
            }

            var _state = this.state,
                votingUp = _state.votingUp,
                votingDown = _state.votingDown,
                showWeight = _state.showWeight,
                showWeightDir = _state.showWeightDir;


            var votingUpActive = voting && votingUp;
            var votingDownActive = voting && votingDown;

            var slider = function slider(up) {
                var b = up ? _this2.state.sliderWeight.up : _this2.state.sliderWeight.down;
                var s = up ? '' : '-';
                return _react2.default.createElement(
                    'span',
                    null,
                    _react2.default.createElement(
                        'div',
                        { className: 'weight-display' },
                        s + b / 100,
                        '%'
                    ),
                    _react2.default.createElement(_reactRangeslider2.default, {
                        min: 100,
                        max: MAX_WEIGHT,
                        step: 100,
                        value: b,
                        onChange: _this2.handleWeightChange(up),
                        onChangeComplete: _this2.storeSliderWeight(up),
                        tooltip: false
                    })
                );
            };

            var downVote = void 0;
            if (true) {
                var down = _react2.default.createElement(_Icon2.default, {
                    name: votingDownActive ? 'empty' : 'chevron-down-circle',
                    className: 'flag'
                });
                var classDown = 'Voting__button Voting__button-down' + (myVote < 0 ? ' Voting__button--downvoted' : '') + (votingDownActive ? ' votingDown' : '');
                // myVote === current vote

                var invokeFlag = _react2.default.createElement(
                    'a',
                    {
                        href: '#',
                        onClick: enable_slider ? this.toggleWeightDown : this.voteDown,
                        title: 'Downvote',
                        id: 'downvote_button',
                        className: 'flag'
                    },
                    down
                );

                var revokeFlag = _react2.default.createElement(
                    'a',
                    {
                        href: '#',
                        onClick: this.voteDown,
                        title: 'Downvote',
                        className: 'flag',
                        id: 'revoke_downvote_button'
                    },
                    down
                );

                var _dropdown = invokeFlag;
                if (enable_slider) {
                    _dropdown = _react2.default.createElement(
                        _Dropdown2.default,
                        {
                            show: showWeight && showWeightDir == 'down',
                            onHide: function onHide() {
                                return _this2.setState({ showWeight: false });
                            },
                            onShow: function onShow() {
                                _this2.setState({ showWeight: true });
                                _this2.readSliderWeight();
                            },
                            title: invokeFlag,
                            position: 'right'
                        },
                        _react2.default.createElement(
                            'div',
                            { className: 'Voting__adjust_weight_down' },
                            (myVote == null || myVote === 0) && enable_slider && _react2.default.createElement(
                                'div',
                                { className: 'weight-container' },
                                slider(false)
                            ),
                            _react2.default.createElement(_CloseButton2.default, {
                                onClick: function onClick() {
                                    return _this2.setState({ showWeight: false });
                                }
                            }),
                            _react2.default.createElement(
                                'div',
                                { className: 'clear Voting__about-flag' },
                                ABOUT_FLAG,
                                _react2.default.createElement('br', null),
                                _react2.default.createElement(
                                    'span',
                                    {
                                        href: '#',
                                        onClick: this.voteDown,
                                        className: 'button outline',
                                        title: 'Downvote'
                                    },
                                    'Submit'
                                )
                            )
                        )
                    );
                }
                downVote = _react2.default.createElement(
                    'span',
                    { className: classDown },
                    myVote === null || myVote === 0 ? _dropdown : revokeFlag
                );
            }

            // payout meta
            var total_votes = post.getIn(['stats', 'total_votes']);
            var payout_at = post.get('payout_at');
            var promoted = amt(post.get('promoted'));
            var max_payout = amt(post.get('max_accepted_payout'));
            var percent_sbd = post.get('percent_steem_dollars') / 20000;

            // pending payout, and completed author/curator payout
            var pending_payout = amt(post.get('pending_payout_value'));
            var author_payout = amt(post.get('author_payout_value'));
            var curator_payout = amt(post.get('curator_payout_value'));
            var total_payout = pending_payout + author_payout + curator_payout;

            // estimated pending payout breakdowns
            var _sbd = pending_payout * percent_sbd;
            var pending_sp = (pending_payout - _sbd) / price_per_steem;
            var pending_sbd = _sbd * (sbd_print_rate / SBD_PRINT_RATE_MAX);
            var pending_steem = (_sbd - pending_sbd) / price_per_steem;

            var pending_trx = 0.0;
            if (vests_per_trx) {
                pending_trx = parseFloat(pending_sp * vests_per_steem / vests_per_trx);
            }
            var payout_limit_hit = total_payout >= max_payout;
            var shown_payout = payout_limit_hit && max_payout > 0 ? max_payout + pending_trx * trx_price : total_payout + pending_trx * trx_price;

            var up = _react2.default.createElement(_Icon2.default, {
                name: votingUpActive ? 'empty' : 'chevron-up-circle',
                className: 'upvote'
            });
            var classUp = 'Voting__button Voting__button-up' + (myVote > 0 ? ' Voting__button--upvoted' : '') + (votingUpActive ? ' votingUp' : '');

            var payoutItems = [];

            // pending payout info
            if (!post.get('is_paidout') && pending_payout > 0) {
                payoutItems.push({
                    value: (0, _counterpart2.default)('voting_jsx.pending_payout', {
                        value: fmt(pending_payout + pending_trx * trx_price)
                    })
                });

                // pending breakdown
                if (max_payout > 0) {
                    payoutItems.push({
                        value: (0, _counterpart2.default)('voting_jsx.breakdown') + ': <br>&nbsp;&nbsp;&nbsp;&nbsp;' + fmt(pending_sbd, _client_config.DEBT_TOKEN_SHORT) + ', ' + (sbd_print_rate != SBD_PRINT_RATE_MAX ? '<br>&nbsp;&nbsp;&nbsp;&nbsp;' + fmt(pending_steem, _client_config.LIQUID_TOKEN_UPPERCASE) + ', ' : '') + '<br>&nbsp;&nbsp;&nbsp;&nbsp;' + fmt(pending_sp, _client_config.INVEST_TOKEN_SHORT) + (vests_per_trx ? ', <br>&nbsp;&nbsp;&nbsp;&nbsp;' + fmt(pending_trx, _client_config.INVEST_TRON_SHORT) : ''),
                        raw: true
                    });
                }

                var beneficiaries = post.get('beneficiaries');
                if (beneficiaries) {
                    beneficiaries.forEach(function (key) {
                        payoutItems.push({
                            value: key.get('account') + ': ' + (fmt(parseFloat(key.get('weight')) / 100) + '%'),
                            link: '/@' + key.get('account')
                        });
                    });
                }

                var payoutDate = _react2.default.createElement(
                    'span',
                    null,
                    (0, _counterpart2.default)('voting_jsx.payout'),
                    ' ',
                    _react2.default.createElement(_TimeAgoWrapper2.default, { date: payout_at })
                );
                payoutItems.push({ value: payoutDate });

                if (pending_payout > 0 && pending_payout < MIN_PAYOUT) {
                    payoutItems.push({
                        value: (0, _counterpart2.default)('voting_jsx.must_reached_minimum_payout')
                    });
                }
            }

            // max payout / payout declined
            if (max_payout == 0) {
                payoutItems.push({ value: (0, _counterpart2.default)('voting_jsx.payout_declined') });
            } else if (max_payout < 1000000) {
                payoutItems.push({
                    value: (0, _counterpart2.default)('voting_jsx.max_accepted_payout', {
                        value: fmt(max_payout)
                    })
                });
            }

            // promoted balance
            if (promoted > 0) {
                payoutItems.push({
                    value: (0, _counterpart2.default)('voting_jsx.promotion_cost', {
                        value: fmt(promoted)
                    })
                });
            }

            // past payout stats
            if (post.get('is_paidout') && total_payout > 0) {
                // estimated author has been payout breakdowns
                var _author_sbd_temp = author_payout * percent_sbd;
                var _author_payout_sp = (author_payout - _author_sbd_temp) / price_per_steem;
                var _curator_sbd_temp = curator_payout * percent_sbd;
                var _curator_payout_sp = (curator_payout - _curator_sbd_temp) / price_per_steem;

                var author_payout_trx = 0;
                var curator_payout_trx = 0;
                if (vests_per_trx) {
                    author_payout_trx = parseFloat(_author_payout_sp * vests_per_steem / vests_per_trx);
                    curator_payout_trx = parseFloat(_curator_payout_sp * vests_per_steem / vests_per_trx);
                }
                var total_payout_trx = author_payout_trx + curator_payout_trx;

                payoutItems.push({
                    value: (0, _counterpart2.default)('voting_jsx.past_payouts', {
                        value: fmt(total_payout) + ', ' + fmt(total_payout_trx, _client_config.INVEST_TRON_SHORT)
                    })
                });
                payoutItems.push({
                    value: (0, _counterpart2.default)('voting_jsx.past_payouts_author', {
                        value: fmt(author_payout) + ', ' + fmt(author_payout_trx, _client_config.INVEST_TRON_SHORT)
                    })
                });
                payoutItems.push({
                    value: (0, _counterpart2.default)('voting_jsx.past_payouts_curators', {
                        value: fmt(curator_payout) + ', ' + fmt(curator_payout_trx, _client_config.INVEST_TRON_SHORT)
                    })
                });
            }

            var payoutEl = _react2.default.createElement(
                _DropdownMenu2.default,
                { el: 'div', items: payoutItems, className: 'Voting__pane' },
                _react2.default.createElement(
                    'span',
                    { style: payout_limit_hit ? { opacity: '0.5' } : {} },
                    _react2.default.createElement(_FormattedAsset2.default, {
                        amount: shown_payout,
                        asset: '$',
                        classname: max_payout === 0 ? 'strikethrough' : ''
                    }),
                    payoutItems.length > 0 && _react2.default.createElement(_Icon2.default, { name: 'dropdown-arrow' })
                )
            );

            var voters_list = null;
            if (showList && total_votes > 0 && active_votes) {
                var voters = [];

                // add top votes
                var avotes = active_votes.toJS();
                var maxlen = Math.min(avotes.length, MAX_VOTES_DISPLAY);
                avotes.sort(function (a, b) {
                    return abs(a.rshares) > abs(b.rshares) ? -1 : 1;
                });
                for (var v = 0; v < maxlen; ++v) {
                    var _avotes$v = avotes[v],
                        rshares = _avotes$v.rshares,
                        voter = _avotes$v.voter;

                    if (rshares == '0') continue;
                    var sign = rshares[0] == '-' ? '- ' : '+ ';
                    voters.push({ value: sign + voter, link: '/@' + voter });
                }

                // add overflow, if any
                var extra = total_votes - voters.length;
                if (extra > 0) {
                    voters.push({
                        value: (0, _counterpart2.default)('voting_jsx.and_more', { count: extra })
                    });
                }

                // build voters list
                voters_list = _react2.default.createElement(_DropdownMenu2.default, {
                    selected: (0, _counterpart2.default)('voting_jsx.votes_plural', {
                        count: total_votes
                    }),
                    className: 'Voting__voters_list',
                    items: voters,
                    el: 'div'
                });
            }

            var voteUpClick = this.voteUp;
            var dropdown = null;
            var voteChevron = votingUpActive ? up : _react2.default.createElement(
                'a',
                {
                    href: '#',
                    onClick: voteUpClick,
                    title: myVote > 0 ? (0, _counterpart2.default)('g.remove_vote') : (0, _counterpart2.default)('g.upvote'),
                    id: 'upvote_button'
                },
                up
            );

            if (myVote <= 0 && enable_slider) {
                voteUpClick = this.toggleWeightUp;
                voteChevron = null;
                // Vote weight adjust
                dropdown = _react2.default.createElement(
                    _Dropdown2.default,
                    {
                        show: showWeight && showWeightDir == 'up',
                        onHide: function onHide() {
                            return _this2.setState({ showWeight: false });
                        },
                        onShow: function onShow() {
                            _this2.setState({
                                showWeight: true,
                                showWeightDir: 'up'
                            });
                            _this2.readSliderWeight();
                        },
                        title: up
                    },
                    _react2.default.createElement(
                        'div',
                        { className: 'Voting__adjust_weight' },
                        votingUpActive ? _react2.default.createElement(
                            'a',
                            {
                                href: '#',
                                onClick: function onClick() {
                                    return null;
                                },
                                className: 'confirm_weight',
                                title: (0, _counterpart2.default)('g.upvote')
                            },
                            _react2.default.createElement(_Icon2.default, { size: '2x', name: 'empty' })
                        ) : _react2.default.createElement(
                            'a',
                            {
                                href: '#',
                                onClick: this.voteUp,
                                className: 'confirm_weight',
                                title: (0, _counterpart2.default)('g.upvote')
                            },
                            _react2.default.createElement(_Icon2.default, { size: '2x', name: 'chevron-up-circle' })
                        ),
                        slider(true),
                        _react2.default.createElement(_CloseButton2.default, {
                            className: 'Voting__adjust_weight_close',
                            onClick: function onClick() {
                                return _this2.setState({ showWeight: false });
                            }
                        })
                    )
                );
            }
            return _react2.default.createElement(
                'span',
                { className: 'Voting' },
                _react2.default.createElement(
                    'span',
                    { className: 'Voting__inner' },
                    _react2.default.createElement(
                        'span',
                        { className: classUp },
                        voteChevron,
                        dropdown
                    ),
                    downVote,
                    payoutEl
                ),
                voters_list
            );
        }
    }]);
    return Voting;
}(_react2.default.Component), _class.propTypes = {
    // HTML properties
    showList: _propTypes2.default.bool,

    // Redux connect properties
    vote: _propTypes2.default.func.isRequired,
    author: _propTypes2.default.string, // post was deleted
    permlink: _propTypes2.default.string,
    username: _propTypes2.default.string,
    is_comment: _propTypes2.default.bool,
    active_votes: _propTypes2.default.object,
    post: _propTypes2.default.object,
    enable_slider: _propTypes2.default.bool,
    voting: _propTypes2.default.bool,
    price_per_steem: _propTypes2.default.number,
    sbd_print_rate: _propTypes2.default.number
}, _class.defaultProps = {
    showList: true
}, _temp);
exports.default = (0, _reactRedux.connect)(
// mapStateToProps
function (state, ownProps) {
    var post = ownProps.post || state.global.getIn(['content', ownProps.post_ref]);

    if (!post) {
        console.error('post_not_found', ownProps);
        throw 'post not found';
    }

    var author = post.get('author');
    var permlink = post.get('permlink');
    var active_votes = post.get('active_votes');
    var is_comment = post.get('depth') == 0;

    var current = state.user.get('current');
    var username = current ? current.get('username') : null;
    var net_vests = current ? current.get('effective_vests') : 0.0;
    var vote_status_key = 'transaction_vote_active_' + author + '_' + permlink;
    var voting = state.global.get(vote_status_key);
    var price_per_steem = (0, _StateFunctions.pricePerSteem)(state) || ownProps.price_per_steem;
    var sbd_print_rate = state.global.getIn(['props', 'sbd_print_rate'], ownProps.sbd_print_rate);
    var enable_slider = net_vests > VOTE_WEIGHT_DROPDOWN_THRESHOLD;

    var myVote = ownProps.myVote || null; // ownProps: test only
    if (username && active_votes) {
        var vote = active_votes.find(function (el) {
            return el.get('voter') === username;
        });
        if (vote) myVote = parseInt(vote.get('rshares'), 10);
    }

    return {
        post: post,
        showList: ownProps.showList,
        net_vests: net_vests,
        author: author,
        permlink: permlink,
        username: username,
        myVote: myVote,
        active_votes: active_votes,
        enable_slider: enable_slider,
        is_comment: is_comment,
        voting: voting,
        price_per_steem: price_per_steem,
        sbd_print_rate: sbd_print_rate,
        vests_per_steem: ownProps.vests_per_steem || (state.global.has('vests_per_steem') ? state.global.get('vests_per_steem') : 0),
        vests_per_trx: ownProps.vests_per_trx || state.app.get('vests_per_trx'),
        tron_price_tronscan: ownProps.tron_price_tronscan || state.app.getIn(['tronPrice', 'price_in_usd']),
        tron_market_price: ownProps.tron_market_price || state.app.getIn(['steemMarket', 'tron', 'timepoints'])
    };
},

// mapDispatchToProps
function (dispatch) {
    return {
        vote: function vote(weight, _ref) {
            var author = _ref.author,
                permlink = _ref.permlink,
                username = _ref.username,
                myVote = _ref.myVote,
                isFlag = _ref.isFlag,
                rshares = _ref.rshares;

            var confirm = function confirm() {
                // new vote
                if (myVote == null) return null;

                // changing a vote
                if (weight === 0) return isFlag ? (0, _counterpart2.default)('voting_jsx.removing_your_vote') : (0, _counterpart2.default)('voting_jsx.removing_your_vote_will_reset_curation_rewards_for_this_post');
                if (weight > 0) return isFlag ? (0, _counterpart2.default)('voting_jsx.changing_to_an_upvote') : (0, _counterpart2.default)('voting_jsx.changing_to_an_upvote_will_reset_curation_rewards_for_this_post');
                if (weight < 0) return isFlag ? (0, _counterpart2.default)('voting_jsx.changing_to_a_downvote') : (0, _counterpart2.default)('voting_jsx.changing_to_a_downvote_will_reset_curation_rewards_for_this_post');
                return null;
            };
            (0, _ServerApiClient.userActionRecord)('vote', {
                vote_type: weight === 0 ? 'cancel' : weight > 0 ? 'up' : 'down',
                voter: username,
                author: author,
                permlink: permlink,
                weight: weight
            });
            dispatch(transactionActions.broadcastOperation({
                type: 'vote',
                operation: {
                    voter: username,
                    author: author,
                    permlink: permlink,
                    weight: weight,
                    __rshares: rshares,
                    __config: {
                        title: weight < 0 ? 'Confirm Downvote' : null
                    }
                },
                confirm: confirm,
                errorCallback: function errorCallback(errorKey) {
                    console.log('Transaction Error:' + errorKey);
                }
            }));
        }
    };
})(Voting);