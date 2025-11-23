'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

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

var _ecc = require('@steemit/steem-js/lib/auth/ecc');

var _qrious = require('qrious');

var _qrious2 = _interopRequireDefault(_qrious);

var _reactRouter = require('react-router');

var _jspdf = require('jspdf');

var _jspdf2 = _interopRequireDefault(_jspdf);

var _RobotoRegular = require('app/assets/fonts/Roboto-Regular.ttf');

var _RobotoRegular2 = _interopRequireDefault(_RobotoRegular);

var _RobotoBold = require('app/assets/fonts/Roboto-Bold.ttf');

var _RobotoBold2 = _interopRequireDefault(_RobotoBold);

var _RobotoMonoRegular = require('app/assets/fonts/RobotoMono-Regular.ttf');

var _RobotoMonoRegular2 = _interopRequireDefault(_RobotoMonoRegular);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function image2canvas(image, bgcolor) {
    var canvas = document.createElement('canvas');
    canvas.width = image.width * 32;
    canvas.height = image.height * 32;

    var ctx = canvas.getContext('2d');
    ctx.fillStyle = bgcolor;
    ctx.fillRect(0.0, 0.0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
}

var PdfDownload = function (_Component) {
    (0, _inherits3.default)(PdfDownload, _Component);

    function PdfDownload(props) {
        (0, _classCallCheck3.default)(this, PdfDownload);

        var _this = (0, _possibleConstructorReturn3.default)(this, (PdfDownload.__proto__ || (0, _getPrototypeOf2.default)(PdfDownload)).call(this, props));

        _this.state = { loaded: false };
        _this.downloadPdf = _this.downloadPdf.bind(_this);
        _this.handleImageLoaded = _this.handleImageLoaded.bind(_this);
        _this.handleImageErrored = _this.handleImageErrored.bind(_this);
        return _this;
    }

    // Generate a list of public and private keys from a master password


    (0, _createClass3.default)(PdfDownload, [{
        key: 'generateKeys',
        value: function generateKeys(name, password) {
            return ['active', 'owner', 'posting', 'memo'].reduce(function (accum, kind, i) {
                var rawKey = _ecc.PrivateKey.fromSeed('' + name + kind + password);
                accum[kind + 'Private'] = rawKey.toString();
                accum[kind + 'Public'] = rawKey.toPublicKey().toString();
                return accum;
            }, { master: password });
        }
    }, {
        key: 'downloadPdf',
        value: function downloadPdf() {
            var keys = this.generateKeys(this.props.name, this.props.password);
            var filename = this.props.filename ? this.props.filename + '.pdf' : this.props.name + '_steem_keys.pdf';
            this.renderPdf(keys, filename).save(filename);
        }
    }, {
        key: 'handleImageLoaded',
        value: function handleImageLoaded() {
            console.log('test image has loaded');
            this.setState({ loaded: true });
            if (this.props.handleImageLoaded) {
                this.props.handleImageLoaded();
            }
        }
    }, {
        key: 'handleImageErrored',
        value: function handleImageErrored() {
            console.error('pdf logo loaded error.');
            this.setState({ loaded: true });
            if (this.props.handleImageErrored) {
                this.props.handleImageErrored();
            }
        }

        // Generate the canvas, which will be generated into a PDF

    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (this.props.download === true && this.state.loaded === true) {
                this.downloadPdf();
            }
        }

        // shouldComponentUpdate(nextProps, nextState){
        //     if(nextProps.download!=undefined) return false;   // just download, not need to render
        //     return true;
        // }

    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps) {
            // start to download pdf key file
            if (this.props.download === true && this.state.loaded === true) {
                this.downloadPdf();
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            return _react2.default.createElement(
                'div',
                {
                    className: 'pdf-download',
                    style: this.props.style ? this.props.style : {}
                },
                _react2.default.createElement('img', {
                    src: '/images/pdf-logo.svg',
                    style: { display: 'none' },
                    className: 'pdf-logo',
                    onLoad: this.handleImageLoaded,
                    onError: this.handleImageErrored
                }),
                !this.props.link ? _react2.default.createElement(
                    'button',
                    {
                        style: { display: 'block' },
                        onClick: function onClick(e) {
                            _this2.downloadPdf();
                            e.preventDefault();
                        }
                    },
                    this.props.label
                ) : _react2.default.createElement(
                    _reactRouter.Link,
                    {
                        style: { display: 'block', color: '#1FBF8F' },
                        onClick: function onClick(e) {
                            _this2.downloadPdf();
                            e.preventDefault();
                        }
                    },
                    this.props.label
                )
            );
        }
    }, {
        key: 'renderText',
        value: function renderText(ctx, text, _ref) {
            var scale = _ref.scale,
                x = _ref.x,
                y = _ref.y,
                lineHeight = _ref.lineHeight,
                maxWidth = _ref.maxWidth,
                color = _ref.color,
                fontSize = _ref.fontSize,
                font = _ref.font;

            var textLines = ctx.setFont(font).setFontSize(fontSize * scale).setTextColor(color).splitTextToSize(text, maxWidth);
            ctx.text(textLines, x, y + fontSize);
            return textLines.length * fontSize * lineHeight;
        }
    }, {
        key: 'drawFilledRect',
        value: function drawFilledRect(ctx, x, y, w, h, _ref2) {
            var color = _ref2.color;

            ctx.setDrawColor(0);
            ctx.setFillColor(color);
            ctx.rect(x, y, w, h, 'F');
        }
    }, {
        key: 'drawStrokedRect',
        value: function drawStrokedRect(ctx, x, y, w, h, _ref3) {
            var color = _ref3.color,
                lineWidth = _ref3.lineWidth;

            ctx.setLineWidth(lineWidth);
            ctx.setDrawColor(color);
            ctx.rect(x, y, w, h);
        }
    }, {
        key: 'drawImageFromCanvas',
        value: function drawImageFromCanvas(ctx, selector, x, y, w, h, bgcolor) {
            var canvas = image2canvas(document.querySelector(selector), bgcolor); // svg -> jpg
            ctx.addImage(canvas.toDataURL('image/jpeg'), 'JPEG', x, y, w, h);
        }
    }, {
        key: 'drawQr',
        value: function drawQr(ctx, data, x, y, size, bgcolor) {
            var canvas = document.createElement('canvas');
            var qr = new _qrious2.default({
                element: canvas,
                size: 250,
                value: data,
                background: bgcolor
            });
            ctx.addImage(canvas, 'PNG', x, y, size, size);
        }
    }, {
        key: 'addPage',
        value: function addPage(ctx) {
            ctx.addPage('letter', 'portrait');
        }
    }, {
        key: 'renderPdf',
        value: function renderPdf(keys, filename) {
            var widthInches = this.props.widthInches,
                //8.5,
            lineHeight = 1.2,
                margin = 0.3,
                maxLineWidth = widthInches - margin * 2.0,
                fontSize = 24,
                scale = 72,
                //ptsPerInch
            oneLineHeight = fontSize * lineHeight / scale,
                qrSize = 1.1;

            var ctx = new _jspdf2.default({
                orientation: 'portrait',
                unit: 'in',
                lineHeight: lineHeight,
                format: 'letter'
            }).setProperties({ title: filename });

            ctx.addFont(_RobotoRegular2.default, 'Roboto-Regular', 'normal');
            ctx.addFont(_RobotoBold2.default, 'Roboto-Bold', 'normal');
            ctx.addFont(_RobotoMonoRegular2.default, 'RobotoMono-Regular', 'normal');

            var offset = 0.0,
                sectionStart = 0,
                sectionHeight = 0;

            // HEADER

            sectionHeight = 1.29;
            this.drawFilledRect(ctx, 0.0, 0.0, widthInches, sectionHeight, {
                color: '#1f0fd1'
            });
            this.drawImageFromCanvas(ctx, '.pdf-logo', widthInches - margin - 1.9, 0.36, 0.98 * 1.8, 0.3 * 1.8, '#1F0FD1');
            offset += 0.265;
            offset += this.renderText(ctx, this.props.filename ? this.props.filename : 'Steem keys for @' + this.props.name, {
                scale: scale,
                x: margin,
                y: offset,
                lineHeight: 1.0,
                maxWidth: maxLineWidth,
                color: 'white',
                fontSize: 0.36,
                font: 'Roboto-Bold'
            });
            // console.log('rendtext 202 to render pdf');
            /*
            offset += 0.1;
            offset += this.renderText(
                ctx,
                'Your recovery account partner: Steemitwallet.com',
                {
                    scale,
                    x: margin,
                    y: offset,
                    lineHeight: 1.0,
                    maxWidth: maxLineWidth,
                    color: 'white',
                    fontSize: 0.18,
                    font: 'Roboto-Bold',
                }
            );
            */

            offset += 0.15;
            offset += this.renderText(ctx, 'Generated at ' + new Date().toISOString().replace(/\.\d{3}/, '') + ' by steemit.com', {
                scale: scale,
                x: margin,
                y: offset,
                lineHeight: 1.0,
                maxWidth: maxLineWidth,
                color: 'white',
                fontSize: 0.14,
                font: 'Roboto-Bold'
            });

            offset = sectionStart + sectionHeight;

            // BODY
            /*
            offset += 0.2;
            offset += this.renderText(
                ctx,
                'Steemit.com is powered by Steem and uses its hierarchical key ' +
                    'system to keep you and your tokens safe. Print this out and ' +
                    'keep it somewhere safe. When in doubt, use your Private ' +
                    'Posting Key as your password, not your Master Password which ' +
                    'is only intended to be used to change your private keys. You ' +
                    'can also view these anytime at: https://steemdb.io/' +
                    this.props.name,
                {
                    scale,
                    x: margin,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth,
                    color: 'black',
                    fontSize: 0.14,
                    font: 'Roboto-Regular',
                }
            );
            */
            // PRIVATE KEYS INTRO

            offset += 0.1;
            offset += this.renderText(ctx, 'Instead of password based authentication, blockchain accounts ' + 'have a set of public and private key pairs that are used for ' + 'authentication as well as the encryption and decryption of ' + 'data. Do not share this file with anyone.', {
                scale: scale,
                x: margin,
                y: offset,
                lineHeight: lineHeight,
                maxWidth: maxLineWidth,
                color: 'black',
                fontSize: 0.14,
                font: 'Roboto-Regular'
            });
            // offset += 0.2;

            if (!this.props.newUser) {
                // tron account information
                offset += 0.2;
                offset += this.renderText(ctx, 'Your Tron account', {
                    scale: scale,
                    x: margin,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth,
                    color: 'black',
                    fontSize: 0.18,
                    font: 'Roboto-Bold'
                });
                offset += 0.1;
                // tron account public key
                sectionStart = offset;
                sectionHeight = qrSize + 0.15 * 2;
                this.drawFilledRect(ctx, 0.0, offset, widthInches, sectionHeight, {
                    color: 'f4f4f4'
                });

                var tron_public_key = this.props.tron_public_key;

                offset += 0.15;
                this.drawQr(ctx, tron_public_key, margin, offset, qrSize, '#f4f4f4');
                offset += 0.1;
                offset += this.renderText(ctx, 'TRON Public Key (TRON Address)', {
                    scale: scale,
                    x: margin + qrSize + 0.1,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth,
                    color: 'black',
                    fontSize: 0.2,
                    font: 'Roboto-Bold'
                });

                offset += this.renderText(ctx, 'Used for transfers. The public key is the address you send the tokens to', {
                    scale: scale,
                    x: margin + qrSize + 0.1,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth - (qrSize + 0.1),
                    color: 'black',
                    fontSize: 0.14,
                    font: 'Roboto-Regular'
                });

                offset += 0.075; // todo: replace tron address
                offset += this.renderText(ctx, tron_public_key, {
                    scale: scale,
                    x: margin + qrSize + 0.1,
                    y: sectionStart + sectionHeight - 0.6,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth,
                    color: 'black',
                    fontSize: 0.14,
                    font: 'RobotoMono-Regular'
                });
                offset += 0.2;
                offset = sectionStart + sectionHeight;

                // tron account private key
                sectionStart = offset;
                sectionHeight = qrSize + 0.15 * 2;
                // this.drawFilledRect(ctx, 0.0, offset, widthInches, sectionHeight, {
                //     color: 'f4f4f4',
                // });
                var tron_private_key = this.props.tron_private_key;

                offset += 0.15;
                this.drawQr(ctx, tron_private_key, margin, offset, qrSize, '#f4f4f4');

                offset += 0.1;
                offset += this.renderText(ctx, 'TRON Private Key', {
                    scale: scale,
                    x: margin + qrSize + 0.1,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth,
                    color: 'black',
                    fontSize: 0.2,
                    font: 'Roboto-Bold'
                });

                offset += this.renderText(ctx, 'This private key has the highest authority on your TRON account. It is ' + 'used for signing transactions of TRON, such as transferring tokens,freezing and voting', {
                    scale: scale,
                    x: margin + qrSize + 0.1,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth - (qrSize + 0.1),
                    color: 'black',
                    fontSize: 0.14,
                    font: 'Roboto-Regular'
                });

                offset += 0.075; // todo: replace tron private key
                offset += this.renderText(ctx, tron_private_key, {
                    scale: scale,
                    x: margin + qrSize + 0.1,
                    y: sectionStart + sectionHeight - 0.4,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth,
                    color: 'black',
                    fontSize: 0.14,
                    font: 'RobotoMono-Regular'
                });
                offset += 0.2;
            } else {
                // Steemit Account
                offset += 0.4;
                offset += this.renderText(ctx, 'Your Steemit Private Keys', {
                    scale: scale,
                    x: margin,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth,
                    color: 'black',
                    fontSize: 0.18,
                    font: 'Roboto-Bold'
                });
                offset += 0.1;
                // POSTING KEY

                sectionStart = offset;
                sectionHeight = qrSize + 0.15 * 2;
                this.drawFilledRect(ctx, 0.0, offset, widthInches, sectionHeight, {
                    color: 'f4f4f4'
                });

                offset += 0.15;
                this.drawQr(ctx, 'steem://import/wif/' + keys.postingPrivate + '/account/' + this.props.name, margin, offset, qrSize, '#f4f4f4');

                offset += 0.1;
                offset += this.renderText(ctx, 'Private Posting Key', {
                    scale: scale,
                    x: margin + qrSize + 0.1,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth,
                    color: 'black',
                    fontSize: 0.14,
                    font: 'Roboto-Bold'
                });

                offset += this.renderText(ctx, 'Used to log in to apps such as Steemit.com and perform social ' + 'actions such as posting, commenting, and voting.', {
                    scale: scale,
                    x: margin + qrSize + 0.1,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth - (qrSize + 0.1),
                    color: 'black',
                    fontSize: 0.14,
                    font: 'Roboto-Regular'
                });

                offset += 0.075;
                offset += this.renderText(ctx, keys.postingPrivate, {
                    scale: scale,
                    x: margin + qrSize + 0.1,
                    y: sectionStart + sectionHeight - 0.6,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth,
                    color: 'black',
                    fontSize: 0.14,
                    font: 'RobotoMono-Regular'
                });
                offset += 0.2;
                offset = sectionStart + sectionHeight;

                // MEMO KEY

                sectionStart = offset;
                sectionHeight = qrSize + 0.15 * 2;
                //this.drawFilledRect(ctx, 0.0, offset, widthInches, sectionHeight, {color: '#f4f4f4'});

                offset += 0.15;
                this.drawQr(ctx, 'steem://import/wif/' + keys.memoPrivate + '/account/' + this.props.name, margin, offset, qrSize, '#ffffff');

                offset += 0.1;

                offset += this.renderText(ctx, 'Private Memo Key', {
                    scale: scale,
                    x: margin + qrSize + 0.1,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth,
                    color: 'black',
                    fontSize: 0.14,
                    font: 'Roboto-Bold'
                });

                offset += this.renderText(ctx, 'Used to decrypt private transfer memos.', {
                    scale: scale,
                    x: margin + qrSize + 0.1,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth - (qrSize + 0.1),
                    color: 'black',
                    fontSize: 0.14,
                    font: 'Roboto-Regular'
                });

                offset += 0.075;
                offset += this.renderText(ctx, keys.memoPrivate, {
                    scale: scale,
                    x: margin + qrSize + 0.1,
                    y: sectionStart + sectionHeight - 0.6,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth,
                    color: 'black',
                    fontSize: 0.14,
                    font: 'RobotoMono-Regular'
                });

                offset += 0.1;
                offset = sectionStart + sectionHeight;

                // ACTIVE KEY

                sectionStart = offset;
                sectionHeight = qrSize + 0.15 * 2;
                this.drawFilledRect(ctx, 0.0, offset, widthInches, sectionHeight, {
                    color: '#f4f4f4'
                });

                offset += 0.15;
                this.drawQr(ctx, 'steem://import/wif/' + keys.activePrivate + '/account/' + this.props.name, margin, offset, qrSize, '#f4f4f4');

                offset += 0.1;

                offset += this.renderText(ctx, 'Private Active Key', {
                    scale: scale,
                    x: margin + qrSize + 0.1,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth,
                    color: 'black',
                    fontSize: 0.14,
                    font: 'Roboto-Bold'
                });

                offset += this.renderText(ctx, 'Used for monetary and wallet related actions, such as ' + 'transferring tokens or powering STEEM up and down.', {
                    scale: scale,
                    x: margin + qrSize + 0.1,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth - (qrSize + 0.1),
                    color: 'black',
                    fontSize: 0.14,
                    font: 'Roboto-Regular'
                });

                offset += 0.075;
                offset += this.renderText(ctx, keys.activePrivate, {
                    scale: scale,
                    x: margin + qrSize + 0.1,
                    y: sectionStart + sectionHeight - 0.6,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth,
                    color: 'black',
                    fontSize: 0.14,
                    font: 'RobotoMono-Regular'
                });

                if (this.props.newUser) {
                    offset += 0.2;
                    offset = sectionStart + sectionHeight;
                } else {
                    // add a new page
                    ctx.addPage('letter', 'portrait');
                    offset = 0.2;
                }

                // OWNER KEY
                sectionStart = offset;
                sectionHeight = qrSize + 0.15 * 2;
                // this.drawFilledRect(ctx, 0.0, offset, widthInches, sectionHeight, {color: '#f4f4f4'});

                offset += 0.15;
                this.drawQr(ctx, 'steem://import/wif/' + keys.ownerPrivate + '/account/' + this.props.name, margin, offset, qrSize, '#ffffff');

                offset += 0.1;

                offset += this.renderText(ctx, 'Private Owner Key', {
                    scale: scale,
                    x: margin + qrSize + 0.1,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth - qrSize - 0.1,
                    color: 'black',
                    fontSize: 0.14,
                    font: 'Roboto-Bold'
                });

                offset += this.renderText(ctx, 'This key is used to reset all your other keys. It is ' + 'recommended to keep it offline at all times. If your ' + 'account is compromised, use this key to recover it ' + 'within 30 days at https://steemitwallet.com.', {
                    scale: scale,
                    x: margin + qrSize + 0.1,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth - (qrSize + 0.1),
                    color: 'black',
                    fontSize: 0.14,
                    font: 'Roboto-Regular'
                });

                offset += 0.075;
                offset += this.renderText(ctx, keys.ownerPrivate, {
                    scale: scale,
                    x: margin + qrSize + 0.1,
                    y: sectionStart + sectionHeight - 0.6,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth - qrSize - 0.1,
                    color: 'black',
                    fontSize: 0.14,
                    font: 'RobotoMono-Regular'
                });

                offset = sectionStart + sectionHeight;

                // MASTER PASSWORD

                sectionHeight = 1;
                sectionStart = offset;
                this.drawFilledRect(ctx, 0.0, offset, widthInches, sectionHeight, {
                    color: '#f4f4f4'
                });

                offset += 0.2;
                offset += this.renderText(ctx, ['Master Password'].join(''), {
                    scale: scale,
                    x: margin,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth,
                    color: 'black',
                    fontSize: 0.14,
                    font: 'Roboto-Bold'
                });

                offset += this.renderText(ctx, 'The seed password used to generate this document. ' + 'Do not share this key.', {
                    scale: scale,
                    x: margin,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth,
                    color: 'black',
                    fontSize: 0.14,
                    font: 'Roboto-Regular'
                });

                offset += 0.075;
                offset += this.renderText(ctx, keys.master, {
                    scale: scale,
                    x: margin,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth,
                    color: 'black',
                    fontSize: 0.14,
                    font: 'RobotoMono-Regular'
                });

                offset = sectionStart + sectionHeight;

                // PUBLIC KEYS INTRO

                sectionStart = offset;
                sectionHeight = 1.0;
                //this.drawFilledRect(ctx, 0.0, offset, widthInches, sectionHeight, {color: '#f4f4f4'});

                offset += 0.1;
                offset += this.renderText(ctx, 'Your Steemit Public Keys', {
                    scale: scale,
                    x: margin,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth,
                    color: 'black',
                    fontSize: 0.18,
                    font: 'Roboto-Bold'
                });

                offset += 0.1;
                offset += this.renderText(ctx, 'Public keys are associated with usernames and are used to ' + 'encrypt and verify messages. Your public keys are not required ' + 'for login. You can view these anytime at: https://steemscan.com/account/' + this.props.name, {
                    scale: scale,
                    x: margin,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth,
                    color: 'black',
                    fontSize: 0.15,
                    font: 'Roboto-Regular'
                });

                offset = sectionStart + sectionHeight;

                // PUBLIC KEYS

                this.renderText(ctx, 'Posting Public', {
                    scale: scale,
                    x: margin,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth,
                    color: 'black',
                    fontSize: 0.14,
                    font: 'Roboto-Bold'
                });

                offset += this.renderText(ctx, keys.postingPublic, {
                    scale: scale,
                    x: 1.25,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth,
                    color: 'black',
                    fontSize: 0.14,
                    font: 'RobotoMono-Regular'
                });

                this.renderText(ctx, 'Memo Public', {
                    scale: scale,
                    x: margin,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth,
                    color: 'black',
                    fontSize: 0.14,
                    font: 'Roboto-Bold'
                });

                offset += this.renderText(ctx, keys.memoPublic, {
                    scale: scale,
                    x: 1.25,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth,
                    color: 'black',
                    fontSize: 0.14,
                    font: 'RobotoMono-Regular'
                });

                this.renderText(ctx, 'Active Public', {
                    scale: scale,
                    x: margin,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth,
                    color: 'black',
                    fontSize: 0.14,
                    font: 'Roboto-Bold'
                });

                offset += this.renderText(ctx, keys.activePublic, {
                    scale: scale,
                    x: 1.25,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth,
                    color: 'black',
                    fontSize: 0.14,
                    font: 'RobotoMono-Regular'
                });

                this.renderText(ctx, 'Owner Public', {
                    scale: scale,
                    x: margin,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth,
                    color: 'black',
                    fontSize: 0.14,
                    font: 'Roboto-Bold'
                });

                offset += this.renderText(ctx, keys.ownerPublic, {
                    scale: scale,
                    x: 1.25,
                    y: offset,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth,
                    color: 'black',
                    fontSize: 0.14,
                    font: 'RobotoMono-Regular'
                });

                this.renderText(ctx, 'v0.1', {
                    scale: scale,
                    x: maxLineWidth - 0.2,
                    y: offset - 0.2,
                    lineHeight: lineHeight,
                    maxWidth: maxLineWidth,
                    color: '#bbbbbb',
                    fontSize: 0.14,
                    font: 'Roboto-Regular'
                });
            }
            return ctx;
        }
    }]);
    return PdfDownload;
}(_react.Component);

exports.default = PdfDownload;