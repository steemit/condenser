'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _UserReducer = require('app/redux/UserReducer');

var userActions = _interopRequireWildcard(_UserReducer);

var _MarkdownViewer = require('app/components/cards/MarkdownViewer');

var _MarkdownViewer2 = _interopRequireDefault(_MarkdownViewer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PostTemplates = function (_Component) {
    (0, _inherits3.default)(PostTemplates, _Component);

    function PostTemplates(props) {
        (0, _classCallCheck3.default)(this, PostTemplates);

        var _this = (0, _possibleConstructorReturn3.default)(this, (PostTemplates.__proto__ || (0, _getPrototypeOf2.default)(PostTemplates)).call(this));

        _this.state = {
            templateList: [{
                title: 'Markdown Basic Template 01',
                image: '![](https://cdn.steemitimages.com/DQmYdjFdAGVTHVF2kq5uh8RFYAPJdtY7vsJzVtn6ksYEtyw/%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA%202023-05-18%20%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE%203.19.17.png)',
                content: '# Main Title\n\n## 01. Sub Title\nThis is the most basic template for beginners using markdown for the first time. By simply editing the text between the check emojis, anyone can create great blog content as if using an editor.\n\nUse an asterisk mark to provide emphasis, such as *italics* or **bold**.\n\nCreate lists with a dash:\n- Item 01\n- Item 02\n- Item 03\n\n~~~\nUse back ticks\nto create a block of code\n~~~\n'
            }, {
                title: 'Markdown Basic Template 02',
                image: '![](https://cdn.steemitimages.com/DQmXy3EoyX2coFDF8mH5mAfwq43LhQz3anHhpa9JkArPjVU/%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA%202023-05-18%20%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE%204.03.18.png)',
                content: '<center>\u2705https://cdn.steemitimages.com/DQmdgm8o8njXdFpdDgF5kuTXjJuAhSg6uPfHgTZu3RkirBE/image%20preview.001.png\u2705</center>\n<center><sup>\u2705Description\u2705</sup></center>\n\n- Quotation : [\u2705LINK\u2705](\u2705https://steemit.com/\u2705)\n\n---\n\n\u2705 \u278A You can write comments or thoughts about the above photo here. \u278B Edit the content between the check emojis, and delete the check emojis at the beginning and end. \u278C The check emoji is marked for the purpose of letting users know which part needs to be corrected.\u2705\n\n1. \u2705Item 01\u2705\n2. \u2705Item 02\u2705\n3. \u2705Item 03\u2705\n<br>\n<br>\n'
            }, {
                title: 'Photo Blog Template 01',
                image: '![](https://cdn.steemitimages.com/DQmU67mv7vkEKZBevteyMYpQRgSFdA8YS7cExLaCFc9QK2z/%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA%202023-05-18%20%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE%203.07.14.png)',
                content: '<center><h2>\u2705Main Title\u2705</h2></center>\n\n<div class="pull-left">\n\u2705\nhttps://cdn.steemitimages.com/DQmdgm8o8njXdFpdDgF5kuTXjJuAhSg6uPfHgTZu3RkirBE/image%20preview.001.png\u2705\n<center><sub>\u2705Description\u2705</sub></center>\n<br>\n</div>\n\n<div class="pull-right">\u2705https://cdn.steemitimages.com/DQmdgm8o8njXdFpdDgF5kuTXjJuAhSg6uPfHgTZu3RkirBE/image%20preview.001.png\u2705\n    <center><sub>\u2705Description\u2705</sub></center>\n    <br>\n</div>\n\n<br>\n\u2705 \u278A You can write comments or thoughts about the above photo here. \u278B Edit the content between the check emojis, and delete the check emojis at the beginning and end. \u278C The check emoji is marked for the purpose of letting users know which part needs to be corrected.\u2705\n\n<center>\n    https://cdn.steemitimages.com/DQmY8UA7YC68Lhh6cLFzdAESxuG8eaonPdPwKcVyEBieXK5/border_06.png\n    <q>\u2705Enter subtitle here\u2705</q>\n    https://cdn.steemitimages.com/DQmY8UA7YC68Lhh6cLFzdAESxuG8eaonPdPwKcVyEBieXK5/border_06.png\n</center>\n\n\u2705 \u278A You can write comments or thoughts about the above photo here. \u278B Edit the content between the check emojis, and delete the check emojis at the beginning and end. \u278C The check emoji is marked for the purpose of letting users know which part needs to be corrected.\u2705\n<br>\n<br>\n'
            }, {
                title: 'Photo Blog Template 02',
                image: '![](https://cdn.steemitimages.com/DQmavWiNcRVVpmVFZv2KrrNGc212JnQyewgzzCYPnccUjAJ/%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA%202023-05-18%20%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE%203.08.02.png)',
                content: '<div class="pull-left">\n<div class="pull-left">\n\u2705https://cdn.steemitimages.com/DQmdgm8o8njXdFpdDgF5kuTXjJuAhSg6uPfHgTZu3RkirBE/image%20preview.001.png\u2705\n</div>\n<div class="pull-right">\n\u2705https://cdn.steemitimages.com/DQmdgm8o8njXdFpdDgF5kuTXjJuAhSg6uPfHgTZu3RkirBE/image%20preview.001.png\u2705\n</div>\n</div>\n<div class="pull-right">\n<div class="pull-left">\n\u2705https://cdn.steemitimages.com/DQmdgm8o8njXdFpdDgF5kuTXjJuAhSg6uPfHgTZu3RkirBE/image%20preview.001.png\u2705\n</div>\n<div class="pull-right">\n\u2705https://cdn.steemitimages.com/DQmdgm8o8njXdFpdDgF5kuTXjJuAhSg6uPfHgTZu3RkirBE/image%20preview.001.png\u2705\n</div>\n</div>\n\n<br>\n<br>\n<div class="pull-left">\n<div class="pull-left">\n\u2705https://cdn.steemitimages.com/DQmdgm8o8njXdFpdDgF5kuTXjJuAhSg6uPfHgTZu3RkirBE/image%20preview.001.png\u2705\n</div>\n<div class="pull-right">\n\u2705https://cdn.steemitimages.com/DQmdgm8o8njXdFpdDgF5kuTXjJuAhSg6uPfHgTZu3RkirBE/image%20preview.001.png\u2705\n</div>\n</div>\n<div class="pull-right">\n<div class="pull-left">\n\u2705https://cdn.steemitimages.com/DQmdgm8o8njXdFpdDgF5kuTXjJuAhSg6uPfHgTZu3RkirBE/image%20preview.001.png\u2705\n</div>\n<div class="pull-right">\n\u2705https://cdn.steemitimages.com/DQmdgm8o8njXdFpdDgF5kuTXjJuAhSg6uPfHgTZu3RkirBE/image%20preview.001.png\u2705\n</div>\n</div>\n\n<br>\n<br>\n<div class="pull-left">\n<div class="pull-left">\n\u2705https://cdn.steemitimages.com/DQmdgm8o8njXdFpdDgF5kuTXjJuAhSg6uPfHgTZu3RkirBE/image%20preview.001.png\u2705\n</div>\n<div class="pull-right">\n\u2705https://cdn.steemitimages.com/DQmdgm8o8njXdFpdDgF5kuTXjJuAhSg6uPfHgTZu3RkirBE/image%20preview.001.png\u2705\n</div>\n</div>\n<div class="pull-right">\n<div class="pull-left">\n\u2705https://cdn.steemitimages.com/DQmdgm8o8njXdFpdDgF5kuTXjJuAhSg6uPfHgTZu3RkirBE/image%20preview.001.png\u2705\n</div>\n<div class="pull-right">\n\u2705https://cdn.steemitimages.com/DQmdgm8o8njXdFpdDgF5kuTXjJuAhSg6uPfHgTZu3RkirBE/image%20preview.001.png\u2705\n</div>\n</div>\n\n\u2705 \u278A You can write comments or thoughts about the above photo here. \u278B Edit the content between the check emojis, and delete the check emojis at the beginning and end. \u278C The check emoji is marked for the purpose of letting users know which part needs to be corrected.\u2705\n<br>\n<br>'
            }, {
                title: 'Photo Blog Template 03',
                image: '![](https://cdn.steemitimages.com/DQmUZ26QNmZGRWC1cVusKPEbwaUb68vN3165e1Wipxk3cXP/%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA%202023-05-18%20%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE%203.12.57.png)\n                    ',
                content: '---\n<div class=pull-left>\n<strong>\u270501. SUB TITLE\u2705</strong>\n</div>\n\n---\n\n<div class="text-justify">\n<div class="pull-left">\n\u2705https://cdn.steemitimages.com/DQmdgm8o8njXdFpdDgF5kuTXjJuAhSg6uPfHgTZu3RkirBE/image%20preview.001.png\u2705\n</div>\n<div class="pull-right">\n</div>\n\u2705\u278A You can use this template if you want to place a photo on the left side of the screen and write text on the right side. \u278B Edit the content between the check emojis, and delete the check emojis at the beginning and end. \u278C The check emoji is marked for the purpose of letting users know which part needs to be corrected.\u2705</div>\n\n<br>\n<br>\n\n\n---\n\n<div class=pull-left>\n<strong>\u270502. SUB TITLE\u2705</strong>\n</div>\n\n---\n\n<div class="text-justify">\n<div class="pull-left">\n\u2705https://cdn.steemitimages.com/DQmdgm8o8njXdFpdDgF5kuTXjJuAhSg6uPfHgTZu3RkirBE/image%20preview.001.png\u2705\n</div>\n<div class="pull-right">\n</div>\n\u2705\u278A You can use this template if you want to place a photo on the left side of the screen and write text on the right side. \u278B Edit the content between the check emojis, and delete the check emojis at the beginning and end. \u278C The check emoji is marked for the purpose of letting users know which part needs to be corrected.\u2705</div>\n<br>\n<br>'
            }, {
                title: 'Table Template 01',
                image: '![image.png](https://cdn.steemitimages.com/DQmXnAKxeT42seqzYNqRLWwtZ78jbAcEQqBu3tyd2Avyo3i/image.png)',
                content: '|\t\u2705Header1\u2705\t|\t\u2705Header1\u2705\t|\t\u2705Header1\u2705\t|\n|\t------------\t|\t------------\t|\t------------\t|\n|    \u2705Text\u2705     \t|     \u2705Text\u2705     \t|     \u2705Text\u2705     \t|'
            }, {
                title: 'Table Template 02',
                image: '![image.png](https://cdn.steemitimages.com/DQmP48Ytssq1XN1a9Ab6UbSY8nvWHDTEjxLNaAuPMy13VY9/image.png)',
                content: '| \u2705Header1\u2705 | \u2705Header2\u2705 | \u2705Header3\u2705 | \u2705Header4\u2705 | \u2705Header5\u2705 |\n|--|--:|--:|--:|--:|\n\u2705Cell01\u2705 | \u27051112\u2705 | \u27051113\u2705 | \u27051114\u2705 | \u27051115\u2705 |\n\u2705Cell02\u2705 | \u27051122\u2705 | \u27051123\u2705 | \u27051124\u2705 | \u27051125\u2705 |\n\u2705Cell03\u2705 | \u27051132\u2705 | \u27051133\u2705 | \u27051134\u2705 | \u27051135\u2705 |\n\u2705Cell04\u2705 | \u27051142\u2705 | \u27051143\u2705 | \u27051144\u2705 | \u27051145\u2705 |\n\u2705Cell05\u2705 | \u27051152\u2705 | \u27051153\u2705 | \u27051154\u2705 | \u27051155\u2705 |'
            }, {
                title: 'Table Template 03',
                image: '![image.png](https://cdn.steemitimages.com/DQmdzz1iYUMZvp5m9qx51DEKmfim7VhbcYTzkk3Drc8atyb/image.png)',
                content: '| \u2705Header1\u2705 | \u2705Header2\u2705| \u2705Header3\u2705 |\n|-|-|-|\n| \u2705https://cdn.steemitimages.com/DQmdgm8o8njXdFpdDgF5kuTXjJuAhSg6uPfHgTZu3RkirBE/image%20preview.001.png\u2705 | **\u2705Sub Title 01\u2705** | \u2705Description\u2705      |\n| \u2705https://cdn.steemitimages.com/DQmdgm8o8njXdFpdDgF5kuTXjJuAhSg6uPfHgTZu3RkirBE/image%20preview.001.png\u2705 | **\u2705Sub Title 02\u2705**  | \u2705Description\u2705 |\n| \u2705https://cdn.steemitimages.com/DQmdgm8o8njXdFpdDgF5kuTXjJuAhSg6uPfHgTZu3RkirBE/image%20preview.001.png\u2705 | **\u2705Sub Title 03\u2705**  | \u2705Description\u2705 |\n<br>\n<br>'
            }]
        };
        return _this;
    }

    // clickContent() {
    //     this.props.hidePostTemplates();
    // }

    (0, _createClass3.default)(PostTemplates, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            // this.getDraftList();
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                username = _props.username,
                onTemplatesClose = _props.onTemplatesClose,
                hidePostTemplates = _props.hidePostTemplates;
            var templateList = this.state.templateList;

            var thumb = '';
            var onClickContent = function onClickContent(idx) {
                console.log(idx);
                // this.clickContent();
                onTemplatesClose(templateList[idx].content);
                hidePostTemplates();
            };

            var templates = templateList.map(function (template, idx) {
                return _react2.default.createElement(
                    'div',
                    { key: idx, className: 'templates-option' },
                    _react2.default.createElement(
                        'div',
                        { className: 'templates__summary' },
                        _react2.default.createElement(
                            'div',
                            { className: 'templates__summary-header' },
                            _react2.default.createElement(
                                'span',
                                null,
                                _react2.default.createElement(
                                    'strong',
                                    null,
                                    idx + 1,
                                    '. ',
                                    template.title
                                )
                            )
                        ),
                        _react2.default.createElement(
                            'div',
                            {
                                className: 'templates__content hentry' + (thumb ? ' with-image ' : ' '),
                                itemScope: true,
                                itemType: 'http://schema.org/blogPost'
                            },
                            _react2.default.createElement(
                                'div',
                                {
                                    className: 'templates__content-block templates__content-block--text',
                                    onClick: function onClick() {
                                        return onClickContent(idx);
                                    }
                                },
                                _react2.default.createElement(_MarkdownViewer2.default, {
                                    text: '<center>' + template.image + '</center>'
                                })
                            )
                        )
                    )
                );
            });

            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    'div',
                    { className: 'row' },
                    _react2.default.createElement(
                        'h3',
                        { className: 'column' },
                        (0, _counterpart2.default)('reply_editor.template')
                    )
                ),
                _react2.default.createElement('hr', null),
                _react2.default.createElement(
                    'div',
                    { className: 'templates-list' },
                    templates
                )
            );
        }
    }]);
    return PostTemplates;
}(_react.Component);

exports.default = (0, _reactRedux.connect)(
// mapStateToProps
function (state, ownProps) {
    var username = state.user.getIn(['current', 'username']);
    return (0, _extends3.default)({}, ownProps, {
        fields: [],
        username: username,
        initialValues: {},
        onTemplatesClose: ownProps.onTemplatesClose
    });
}, function (dispatch) {
    return {
        hidePostTemplates: function hidePostTemplates() {
            return dispatch(userActions.hidePostTemplates());
        }
    };
})(PostTemplates);