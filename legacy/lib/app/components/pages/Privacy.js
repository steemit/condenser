'use strict';

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

var _AppReducer = require('app/redux/AppReducer');

var appActions = _interopRequireWildcard(_AppReducer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Privacy = function (_React$Component) {
    (0, _inherits3.default)(Privacy, _React$Component);

    function Privacy() {
        (0, _classCallCheck3.default)(this, Privacy);
        return (0, _possibleConstructorReturn3.default)(this, (Privacy.__proto__ || (0, _getPrototypeOf2.default)(Privacy)).apply(this, arguments));
    }

    (0, _createClass3.default)(Privacy, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.props.setRouteTag();
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { className: 'Privacy row' },
                _react2.default.createElement(
                    'div',
                    { className: 'column large-12' },
                    _react2.default.createElement(
                        'h1',
                        null,
                        'Steemit, Inc Privacy Policy'
                    ),
                    _react2.default.createElement(
                        'h2',
                        null,
                        'Effective: Oct 7, 2019'
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            null,
                            'This Privacy Policy describes how Steemit collects, uses and discloses information, and what choices you have with respect to the information. This Policy applies to the'
                        ),
                        _react2.default.createElement(
                            'span',
                            null,
                            '\xA0Steemit.com, steemit subdomains (e.g., signup.steemit.com) and services'
                        ),
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            '\xA0(collectively, \u201CServices\u201D).'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'Updates in this version of the Privacy Policy reflect changes in data protection law.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'When we refer to \u201CSteemit\u201D, we mean the Steemit entity that acts as the controller of your information.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'By using the Services, you accept the terms of this Policy and our Terms of Service, and consent to our initial collection, use, disclosure, and retention of your information as described in this Policy and Terms of Service.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'Please note that this Policy does not apply to information collected through third-party websites or services that you may access through the Services or that you submit to us through email, text message or other electronic message or offline.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'If you are visiting this site from the European Union (EU), see our Notice to EU Data Subjects below for our legal bases for processing and transfer of your data.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'h3',
                        null,
                        'WHAT WE COLLECT'
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'We get information about you in a range of ways.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'Information You Give Us. Information we collect from you includes:'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'IP address;'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'Language information;'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            null,
                            'Contact information, such as your email address and telephone number;'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'Information Automatically Collected. We may automatically record certain information about how you use our Site (we refer to this information as \u201CLog Data\u201C). Log Data may include information such as a user\u2019s Internet Protocol (IP) address, device and browser type, and operating system. We use this information to administer and provide access to the Services'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'Information we will never collect. We will never ask you to share your private keys or wallet seed. Never trust anyone or any site that asks you to enter your private keys or wallet seed.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'h3',
                        null,
                        'USE OF PERSONAL INFORMATION'
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'To provide our service we will use your personal information in the following ways:'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'ul',
                        { className: 'c16 lst-kix_umcklwsd66fi-0 start' },
                        _react2.default.createElement(
                            'li',
                            { className: 'c2 c9' },
                            _react2.default.createElement(
                                'span',
                                { className: 'c1' },
                                'To enable you to access and use the Services'
                            )
                        ),
                        _react2.default.createElement(
                            'li',
                            { className: 'c2 c9' },
                            _react2.default.createElement(
                                'span',
                                { className: 'c1' },
                                'To comply with law'
                            )
                        ),
                        _react2.default.createElement(
                            'li',
                            { className: 'c2 c9' },
                            _react2.default.createElement(
                                'span',
                                { className: 'c1' },
                                'We use your personal information as we believe necessary or appropriate to comply with applicable laws, lawful requests and legal process, such as to respond to subpoenas or requests from government authorities. \xA0'
                            )
                        ),
                        _react2.default.createElement(
                            'li',
                            { className: 'c2 c9' },
                            _react2.default.createElement(
                                'span',
                                { className: 'c1' },
                                'For compliance, fraud prevention, and safety'
                            )
                        ),
                        _react2.default.createElement(
                            'li',
                            { className: 'c2 c9' },
                            _react2.default.createElement(
                                'span',
                                { className: 'c1' },
                                'Communications'
                            )
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'We may use your personal information to protect, investigate, and deter against fraudulent, unauthorized, or illegal activity.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'We may use your personal information to contact you with newsletters, marketing or promotional materials and other information that may be of interest to you. You may opt out of receiving any, or all, of these communications from us by following the unsubscribe or instructions provided in any email send.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'h3',
                        { className: 'c6' },
                        'SHARING OF PERSONAL INFORMATION'
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'We do not share or sell the personal information that you provide us with other organizations without your express consent, except as described in this Privacy Policy. We disclose personal information to third parties under the following circumstances:'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'Affiliates. We may disclose your personal information to our subsidiaries and corporate affiliates for purposes consistent with this Privacy Policy.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'Business Transfers. We may share personal information when we do a business deal, or negotiate a business deal, involving the sale or transfer of all or a part of our business or assets. These deals can include any merger, financing, acquisition, or bankruptcy transaction or proceeding.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'Compliance with Laws and Law Enforcement; Protection and Safety. We may share personal information for legal, protection, and safety purposes.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'We may share information to comply with laws.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'We may share information to respond to lawful requests and legal processes.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'Professional Advisors and Service Providers. We may share information with those who need it to do work for us. These recipients may include third party companies and individuals to administer and provide the Service on our behalf (such as customer support, hosting, email delivery and database management services), as well as lawyers, bankers, auditors, and insurers.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'Other. You may permit us to share your personal information with other companies or entities of your choosing. Those uses will be subject to the privacy policies of the recipient entity or entities.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'We may also share aggregated and/or anonymized data with others for their own uses.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'h3',
                        { className: 'c6' },
                        'INTERNATIONAL TRANSFER'
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'The Company has offices outside of the EU and has affiliates and service providers in the United States and in other countries. Your personal information may be transferred to or from the United States or other locations outside of your state, province, country or other governmental jurisdiction where privacy laws may not be as protective as those in your jurisdiction.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'EU users should read the important information provided \xA0below about transfer of personal information outside of the European Economic Area (EEA).'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'h3',
                        { className: 'c6' },
                        'HOW INFORMATION IS SECURED'
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'We retain information we collect as long as it is necessary and relevant to fulfill the purposes outlined in this privacy policy. In addition, we retain personal information to comply with applicable law where required, prevent fraud, resolve disputes, troubleshoot problems, assist with any investigation, enforce our Terms of Service, and other actions permitted by law. To determine the appropriate retention period for personal information, we consider the amount, nature, and sensitivity of the personal information, the potential risk of harm from unauthorized use or disclosure of your personal information, the purposes for which we process your personal information and whether we can achieve those purposes through other means, and the applicable legal requirements.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'In some circumstances we may anonymize your personal information (so that it can no longer be associated with you) in which case we may use this information indefinitely without further notice to you. \xA0',
                            ' '
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'We employ industry standard security measures designed to protect the security of all information submitted through the Services. However, the security of information transmitted through the internet can never be guaranteed. We are not responsible for any interception or interruption of any communications through the internet or for changes to or losses of data. Users of the Services are responsible for maintaining the security of any password, user ID or other form of authentication involved in obtaining access to password protected or secure areas of any of our digital services.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'h3',
                        { className: 'c6' },
                        'INFORMATION CHOICES AND CHANGES'
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'Accessing, Updating, Correcting, and Deleting your Information'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            null,
                            'You may access information that you have voluntarily provided through your account on the Services, and to review, correct, or delete it by sending a request to privacy@steemit.com. You can request to change contact choices, opt-out of our sharing with others, and update your personal information and preferences. We may require that you are the you are the user who you say you are by proving that you have control of your posting key via our conveyor API. \xA0For more information about our conveyor API please see',
                            ' '
                        ),
                        _react2.default.createElement(
                            'span',
                            { className: 'c8 c12' },
                            _react2.default.createElement(
                                'a',
                                {
                                    className: 'c5',
                                    href: 'https://www.google.com/url?q=https://github.com/steemit/conveyor%23get_user_data-username&sa=D&ust=1527292847102000'
                                },
                                'here'
                            )
                        ),
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            '.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'h3',
                        { className: 'c8 c20' },
                        'CONTACT INFORMATION.'
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            '\xA0We welcome your comments or questions about this Policy, and you may contact us at: privacy@steemit.com.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'h3',
                        { className: 'c8 c20' },
                        'CHANGES TO THIS PRIVACY POLICY.'
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            '\xA0We may change this privacy policy at any time. We encourage you to periodically review this page for the latest information on our privacy practices. If we make any changes, we will change the Last Updated date above.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'Any modifications to this Privacy Policy will be effective upon our posting of the new terms and/or upon implementation of the changes to the Site (or as otherwise indicated at the time of posting). In all cases, your continued use of the the Site or Services after the posting of any modified Privacy Policy indicates your acceptance of the terms of the modified Privacy Policy.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'h3',
                        { className: 'c6' },
                        'ELIGIBILITY'
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'If you are under the age of majority in your jurisdiction of residence, you may use the Services only with the consent of or under the supervision of your parent or legal guardian. Consistent with the requirements of the Children\'s Online Privacy Protection Act (COPPA), if we learn that we have received any information directly from a child under age 13 without first receiving his or her parent\'s verified consent, we will use that information only to respond directly to that child (or his or her parent or legal guardian) to inform the child that he or she cannot use the Site and subsequently we will delete that information.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'h3',
                        { className: 'c6' },
                        'NOTICE TO CALIFORNIA RESIDENTS'
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'Under California Civil Code Section 1789.3, California users are entitled to the following consumer rights notice: California residents may reach the Complaint Assistance Unit of the Division of Consumer Services of the California Department of Consumer Affairs by mail at 1625 North Market Blvd., Sacramento, CA 95834, or by telephone at (916) 445-1254 or (800) 952-5210.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'h3',
                        { className: 'c6' },
                        'NOTICE TO EU DATA SUBJECTS'
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'h4',
                            { className: 'c6' },
                            'Personal Information'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'With respect to EU data subjects, \u201Cpersonal information,\u201D as used in this Privacy Policy, is equivalent to \u201Cpersonal data\u201D as defined in the European Union General Data Protection Regulation (GDPR).'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'h4',
                            { className: 'c20 c23' },
                            'Legal Bases for Processing'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'We only use your personal information as permitted by law. We are required to inform you of the legal bases of our processing of your personal information, which are described in the table below. If you have questions about the legal bases under which we process your personal information, contact us at legal@steemit.com.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'h4',
                            { className: 'c6' },
                            'Processing Purpose'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'ul',
                        { className: 'c16 lst-kix_5gmcovz1lhm4-0 start' },
                        _react2.default.createElement(
                            'li',
                            { className: 'c2 c9' },
                            _react2.default.createElement(
                                'span',
                                { className: 'c1' },
                                'Legal Basis'
                            )
                        ),
                        _react2.default.createElement(
                            'li',
                            { className: 'c2 c9' },
                            _react2.default.createElement(
                                'span',
                                { className: 'c1' },
                                'For compliance, fraud prevention, and safety'
                            )
                        ),
                        _react2.default.createElement(
                            'li',
                            { className: 'c2 c9' },
                            _react2.default.createElement(
                                'span',
                                { className: 'c1' },
                                'To provide our service'
                            )
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'These processing activities constitute our legitimate interests. We make sure we consider and balance any potential impacts on you (both positive and negative) and your rights before we process your personal information for our legitimate interests. We do not use your personal information for activities where our interests are overridden by any adverse impact on you (unless we have your consent or are otherwise required or permitted to by law).'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'h4',
                            { className: 'c8 c20' },
                            'With your consent'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'Where our use of your personal information is based upon your consent, you have the right to withdraw it anytime in the manner indicated in the Service or by contacting us at privacy@steemit.com'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'h4',
                            { className: 'c6' },
                            'Use for New Purposes'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'We may use your personal information for reasons not described in this Privacy Policy, where we are permitted by law to do so and where the reason is compatible with the purpose for which we collected it. If we need to use your personal information for an unrelated purpose, we will notify you and explain the applicable legal basis for that use. If we have relied upon your consent for a particular use of your personal information, we will seek your consent for any unrelated purpose.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'h4',
                            { className: 'c6' },
                            'Your Rights'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'Under the GDPR, you have certain rights regarding your personal information. You may ask us to take the following actions in relation to your personal information that we hold:'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c8' },
                            'Opt-out'
                        ),
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            '. Stop sending you direct marketing communications which you have previously consented to receive. We may continue to send you Service-related and other non-marketing communications.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c8' },
                            'Access'
                        ),
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            '. Provide you with information about our processing of your personal information and give you access to your personal information.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c8' },
                            'Correct'
                        ),
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            '. Update or correct inaccuracies in your personal information.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c8' },
                            'Delete'
                        ),
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            '. Delete your personal information.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c8' },
                            'Transfer'
                        ),
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            '. Transfer a machine-readable copy of your personal information to you or a third party of your choice.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c8' },
                            'Restrict'
                        ),
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            '. Restrict the processing of your personal information.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c8' },
                            'Object'
                        ),
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            '. Object to our reliance on our legitimate interests as the basis of our processing of your personal information that impacts your rights.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            null,
                            'You can submit these requests by email to privacy@steemit.com. We may request specific information from you to help us confirm your identity and process your request. Applicable law may require or permit us to decline your request. If we decline your request, we will tell you why, subject to legal restrictions. If you would like to submit a complaint about our use of your personal information or response to your requests regarding your personal information, you may contact us at privacy@steemit.com or submit a complaint to the data protection regulator in your jurisdiction. You can find your data protection regulator',
                            ' '
                        ),
                        _react2.default.createElement(
                            'span',
                            { className: 'c8 c12' },
                            _react2.default.createElement(
                                'a',
                                {
                                    className: 'c5',
                                    href: 'https://www.google.com/url?q=http://ec.europa.eu/justice/article-29/structure/data-protection-authorities/index_en.htm&sa=D&ust=1527292847107000'
                                },
                                'here'
                            )
                        ),
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            '.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'h4',
                            { className: 'c6' },
                            'Cross-Border Data Transfer'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'Please be aware that your personal data will be transferred to, processed, and stored in the United States. Data protection laws in the U.S. may be different from those in your country of residence. You consent to the transfer of your information, including personal information, to the U.S. as set forth in this Privacy Policy by visiting our site or using our service.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'Whenever we transfer your personal information out of the EEA to the U.S. or countries not deemed by the European Commission to provide an adequate level of personal information protection, the transfer will be based on a data transfer mechanism recognized by the European Commission as providing adequate protection for personal information.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'Please contact us if you want further information on the specific mechanism used by us when transferring your personal information out of the EEA.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'h4',
                            { className: 'c6' },
                            'Why do we use Cookies?'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'We generally use Cookies for the following purposes:'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'ul',
                        { className: 'c16 lst-kix_a4jg53v083t7-0 start' },
                        _react2.default.createElement(
                            'li',
                            { className: 'c2 c9' },
                            _react2.default.createElement(
                                'span',
                                { className: 'c1' },
                                'To allow registered users to stay logged in to the site after they close their browser window;'
                            )
                        ),
                        _react2.default.createElement(
                            'li',
                            { className: 'c2 c9' },
                            _react2.default.createElement(
                                'span',
                                { className: 'c1' },
                                'To store users\' preferences for site functionality; and'
                            )
                        ),
                        _react2.default.createElement(
                            'li',
                            { className: 'c2 c9' },
                            _react2.default.createElement(
                                'span',
                                { className: 'c1' },
                                'To track site usage so we can improve our site & better understand how people are using it'
                            )
                        ),
                        _react2.default.createElement(
                            'li',
                            { className: 'c2 c9' },
                            _react2.default.createElement(
                                'span',
                                { className: 'c1' },
                                'To better understand the interests of our customers and our website visitors.'
                            )
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'Some Cookies are necessary for certain uses of the Site, and without such Cookies, we would not be able to provide many services that you need to properly use the Site. These Cookies, for example, allow us to operate our Site so you may access it as you have requested and let us recognize that you have created an account and have logged into that account to access Site content. They also include Cookies that enable us to remember your previous actions within the same browsing session and secure our Sites. \xA0'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c1' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'We also use functional Cookies and Cookies from third parties for analysis and marketing purposes. \xA0Functional Cookies enable certain parts of the site to work properly and your user preferences to remain known. \xA0Analysis Cookies, among other things, collect information on how visitors use our Site, the content and products that users view most frequently, and the effectiveness of our third party advertising. Advertising Cookies assist in delivering ads to relevant audiences and having our ads appear at the top of search results. Cookies are either \u201Csession\u201D Cookies which are deleted when you end your browser session, or \u201Cpersistent,\u201D which remain until their deletion by you (discussed below) or the party who served the cookie. \xA0Full details on all of the Cookies used on the Site are available at our Cookie Disclosure table below.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'h4',
                            { className: 'c6' },
                            'How to disable Cookies. '
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            null,
                            'You can generally activate or later deactivate the use of cookies through a functionality built into your web browser. To learn more about how to control'
                        ),
                        _react2.default.createElement(
                            'span',
                            null,
                            '\xA0cookie settings through your browser:'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            null,
                            'Click '
                        ),
                        _react2.default.createElement(
                            'span',
                            { className: 'c8 c12' },
                            _react2.default.createElement(
                                'a',
                                {
                                    className: 'c5',
                                    href: 'https://www.google.com/url?q=https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences&sa=D&ust=1527292847109000'
                                },
                                'here'
                            )
                        ),
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            '\xA0to learn more about the \u201CPrivate Browsing\u201D setting and managing cookie settings in Firefox;'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            null,
                            'Click '
                        ),
                        _react2.default.createElement(
                            'span',
                            { className: 'c8 c12' },
                            _react2.default.createElement(
                                'a',
                                {
                                    className: 'c5',
                                    href: 'https://www.google.com/url?q=https://support.google.com/chrome/answer/95647?hl%3Den&sa=D&ust=1527292847109000'
                                },
                                'here'
                            )
                        ),
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            '\xA0to learn more about \u201CIncognito\u201D and managing cookie settings in Chrome;'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            null,
                            'Click '
                        ),
                        _react2.default.createElement(
                            'span',
                            { className: 'c8 c12' },
                            _react2.default.createElement(
                                'a',
                                {
                                    className: 'c5',
                                    href: 'https://www.google.com/url?q=https://support.microsoft.com/en-us/help/17442/windows-internet-explorer-delete-manage-cookies&sa=D&ust=1527292847110000'
                                },
                                'here'
                            )
                        ),
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            '\xA0to learn more about \u201CInPrivate\u201D and managing cookie settings in Internet Explorer; or'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            null,
                            'Click '
                        ),
                        _react2.default.createElement(
                            'span',
                            { className: 'c8 c12' },
                            _react2.default.createElement(
                                'a',
                                {
                                    className: 'c5',
                                    href: 'https://www.google.com/url?q=https://support.apple.com/kb/ph21411?locale%3Den_US&sa=D&ust=1527292847110000'
                                },
                                'here'
                            )
                        ),
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            '\xA0to learn more about \u201CPrivate Browsing\u201D and managing cookie settings in Safari.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'If you want to learn more about cookies, or how to control, disable or delete them, please visit http://www.aboutcookies.org for detailed guidance. In addition, certain third party advertising networks, including Google, permit users to opt out of or customize preferences associated with your internet browsing.'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c0' },
                        _react2.default.createElement('span', { className: 'c1' })
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'c2' },
                        _react2.default.createElement(
                            'span',
                            { className: 'c1' },
                            'We may link the information collected by Cookies with other information we collect from you pursuant to this Privacy Policy and use the combined information as set forth herein. \xA0Similarly, the third parties who serve cookies on our Site may link your name or email address to other information they collect, which may include past purchases made offline or online, or your online usage information. If you are located in the European Economic Area, you have certain rights that are described above under the header \u201CNotice to EU Data Subjects\u201D, including the right to inspect and correct or delete the data that we have about you.'
                        )
                    )
                )
            );
        }
    }]);
    return Privacy;
}(_react2.default.Component);

module.exports = {
    path: 'privacy.html',
    component: (0, _reactRedux.connect)(function (state, ownProps) {
        return {};
    }, function (dispatch) {
        return {
            setRouteTag: function setRouteTag() {
                return dispatch(appActions.setRouteTag({ routeTag: 'privacy' }));
            }
        };
    })(Privacy)
};