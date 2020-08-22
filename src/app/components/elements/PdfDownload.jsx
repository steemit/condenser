import React, { Component } from 'react';
import { PrivateKey } from '@steemit/steem-js/lib/auth/ecc';
import QRious from 'qrious';
import { Link } from 'react-router';

function image2canvas(image, bgcolor) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width * 32;
    canvas.height = image.height * 32;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bgcolor;
    ctx.fillRect(0.0, 0.0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
}

export default class PdfDownload extends Component {
    constructor(props) {
        super(props);
        this.downloadPdf = this.downloadPdf.bind(this);
        this.state = { loaded: false };
    }

    // Generate a list of public and private keys from a master password
    generateKeys(name, password) {
        return ['active', 'owner', 'posting', 'memo'].reduce(
            (accum, kind, i) => {
                const rawKey = PrivateKey.fromSeed(`${name}${kind}${password}`);
                accum[`${kind}Private`] = rawKey.toString();
                accum[`${kind}Public`] = rawKey.toPublicKey().toString();
                return accum;
            },
            { master: password }
        );
    }

    downloadPdf() {
        const keys = this.generateKeys(this.props.name, this.props.password);
        const filename = this.props.name + '_steem_keys.pdf';
        this.renderPdf(keys, filename).save(filename);
    }

    // Generate the canvas, which will be generated into a PDF
    async componentDidMount() {
        // Load jsPDF. It does not work with webpack, so it must be loaded here.
        // On the plus side, it is only loaded when the warning page is shown.
        this.setState({ loaded: false });
        await new Promise((res, rej) => {
            const s = document.createElement('script');
            s.type = 'text/javascript';
            s.src = 'https://staticfiles.steemit.com/jspdf.min.js';
            document.body.appendChild(s);
            s.addEventListener('load', res);
        });

        await new Promise((res, rej) => {
            const s = document.createElement('script');
            s.type = 'text/javascript';
            s.src = 'https://staticfiles.steemit.com/Roboto-Regular-normal.js';
            document.body.appendChild(s);
            s.addEventListener('load', res);
        });

        await new Promise((res, rej) => {
            const s = document.createElement('script');
            s.type = 'text/javascript';
            s.src = 'https://staticfiles.steemit.com/Roboto-Bold-normal.js';
            document.body.appendChild(s);
            s.addEventListener('load', res);
        });

        await new Promise((res, rej) => {
            const s = document.createElement('script');
            s.type = 'text/javascript';
            s.src =
                'https://staticfiles.steemit.com/RobotoMono-Regular-normal.js';
            document.body.appendChild(s);
            s.addEventListener('load', res);
        });
        this.setState({ loaded: true });
    }

    // shouldComponentUpdate(nextProps, nextState){
    //     if(nextProps.download!=undefined) return false;   // just download, not need to render
    //     return true;
    // }
    componentDidUpdate(prevProps) {
        // start to download pdf key file
        if (this.props.download !== prevProps.download || this.props.download) {
            this.downloadPdf();
        }
    }

    render() {
        return (
            <div className="pdf-download">
                <img
                    src="/images/pdf-logo.svg"
                    style={{ display: 'none' }}
                    className="pdf-logo"
                />
                {this.state.loaded &&
                    (!this.props.link ? (
                        <button
                            style={{ display: 'block' }}
                            onClick={e => {
                                this.downloadPdf();
                                e.preventDefault();
                            }}
                        >
                            {this.props.label}
                        </button>
                    ) : (
                        <Link
                            style={{ display: 'block' }}
                            onClick={e => {
                                this.downloadPdf();
                                e.preventDefault();
                            }}
                        >
                            {this.props.label}
                        </Link>
                    ))}
            </div>
        );
    }

    renderText(
        ctx,
        text,
        { scale, x, y, lineHeight, maxWidth, color, fontSize, font }
    ) {
        var textLines = ctx
            .setFont(font)
            .setFontSize(fontSize * scale)
            .setTextColor(color)
            .splitTextToSize(text, maxWidth);
        ctx.text(textLines, x, y + fontSize);
        return textLines.length * fontSize * lineHeight;
    }

    drawFilledRect(ctx, x, y, w, h, { color }) {
        ctx.setDrawColor(0);
        ctx.setFillColor(color);
        ctx.rect(x, y, w, h, 'F');
    }

    drawStrokedRect(ctx, x, y, w, h, { color, lineWidth }) {
        ctx.setLineWidth(lineWidth);
        ctx.setDrawColor(color);
        ctx.rect(x, y, w, h);
    }

    drawImageFromCanvas(ctx, selector, x, y, w, h, bgcolor) {
        const canvas = image2canvas(document.querySelector(selector), bgcolor); // svg -> jpg
        ctx.addImage(canvas.toDataURL('image/jpeg'), 'JPEG', x, y, w, h);
    }

    drawQr(ctx, data, x, y, size, bgcolor) {
        const canvas = document.createElement('canvas');
        var qr = new QRious({
            element: canvas,
            size: 250,
            value: data,
            background: bgcolor,
        });
        ctx.addImage(canvas, 'PNG', x, y, size, size);
    }
    addPage(ctx) {
        ctx.addPage('letter', 'portrait');
    }

    renderPdf(keys, filename) {
        const widthInches = this.props.widthInches, //8.5,
            lineHeight = 1.2,
            margin = 0.3,
            maxLineWidth = widthInches - margin * 2.0,
            fontSize = 24,
            scale = 72, //ptsPerInch
            oneLineHeight = fontSize * lineHeight / scale,
            qrSize = 1.1;

        const ctx = new jsPDF({
            orientation: 'portrait',
            unit: 'in',
            lineHeight: lineHeight,
            format: 'letter',
        }).setProperties({ title: filename });

        let offset = 0.0,
            sectionStart = 0,
            sectionHeight = 0;

        // HEADER

        sectionHeight = 1.29;
        this.drawFilledRect(ctx, 0.0, 0.0, widthInches, sectionHeight, {
            color: '#1f0fd1',
        });
        this.drawImageFromCanvas(
            ctx,
            '.pdf-logo',
            widthInches - margin - 1.9,
            0.36,
            0.98 * 1.8,
            0.3 * 1.8,
            '#1F0FD1'
        );
        offset += 0.265;
        offset += this.renderText(ctx, `Steem keys for @${this.props.name}`, {
            scale,
            x: margin,
            y: offset,
            lineHeight: 1.0,
            maxWidth: maxLineWidth,
            color: 'white',
            fontSize: 0.36,
            font: 'Roboto-Bold',
        });
        console.log('rendtext 202 to render pdf');
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
        offset += this.renderText(
            ctx,
            'Generated at ' +
                new Date().toISOString().replace(/\.\d{3}/, '') +
                ' by steemit.com',
            {
                scale,
                x: margin,
                y: offset,
                lineHeight: 1.0,
                maxWidth: maxLineWidth,
                color: 'white',
                fontSize: 0.14,
                font: 'Roboto-Bold',
            }
        );

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
        offset += this.renderText(
            ctx,
            'Instead of password based authentication, blockchain accounts ' +
                'have a set of public and private key pairs that are used for ' +
                'authentication as well as the encryption and decryption of ' +
                'data. Do not share this file with anyone.',
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
        // offset += 0.2;

        // tron account information
        offset += 0.2;
        offset += this.renderText(ctx, 'Your Tron account', {
            scale,
            x: margin,
            y: offset,
            lineHeight: lineHeight,
            maxWidth: maxLineWidth,
            color: 'black',
            fontSize: 0.18,
            font: 'Roboto-Bold',
        });
        offset += 0.1;
        // tron account public key
        sectionStart = offset;
        sectionHeight = qrSize + 0.15 * 2;
        this.drawFilledRect(ctx, 0.0, offset, widthInches, sectionHeight, {
            color: 'f4f4f4',
        });

        const tron_public_key = this.props.tron_public_key;

        offset += 0.15;
        this.drawQr(
            ctx,
            'steem://import/wif/' +
                tron_public_key +
                '/account/' +
                this.props.name,
            margin,
            offset,
            qrSize,
            '#f4f4f4'
        );
        offset += 0.1;
        offset += this.renderText(
            ctx,
            'TRON Account Public key(Tron Account Address)',
            {
                scale,
                x: margin + qrSize + 0.1,
                y: offset,
                lineHeight: lineHeight,
                maxWidth: maxLineWidth,
                color: 'black',
                fontSize: 0.2,
                font: 'Roboto-Bold',
            }
        );

        offset += this.renderText(
            ctx,
            'Used for transfers. The public key is the address you send the tokens to',
            {
                scale,
                x: margin + qrSize + 0.1,
                y: offset,
                lineHeight: lineHeight,
                maxWidth: maxLineWidth - (qrSize + 0.1),
                color: 'black',
                fontSize: 0.14,
                font: 'Roboto-Regular',
            }
        );

        offset += 0.075; // todo: replace tron address
        offset += this.renderText(ctx, tron_public_key, {
            scale,
            x: margin + qrSize + 0.1,
            y: sectionStart + sectionHeight - 0.6,
            lineHeight: lineHeight,
            maxWidth: maxLineWidth,
            color: 'black',
            fontSize: 0.14,
            font: 'RobotoMono-Regular',
        });
        offset += 0.2;
        offset = sectionStart + sectionHeight;

        // tron account private key
        sectionStart = offset;
        sectionHeight = qrSize + 0.15 * 2;
        // this.drawFilledRect(ctx, 0.0, offset, widthInches, sectionHeight, {
        //     color: 'f4f4f4',
        // });
        const tron_private_key = this.props.tron_private_key;

        offset += 0.15;
        this.drawQr(
            ctx,
            'steem://import/wif/' +
                tron_private_key +
                '/account/' +
                this.props.name,
            margin,
            offset,
            qrSize,
            '#f4f4f4'
        );

        offset += 0.1;
        offset += this.renderText(ctx, 'TRON Account Private Key', {
            scale,
            x: margin + qrSize + 0.1,
            y: offset,
            lineHeight: lineHeight,
            maxWidth: maxLineWidth,
            color: 'black',
            fontSize: 0.2,
            font: 'Roboto-Bold',
        });

        offset += this.renderText(
            ctx,
            'This private key has the highest authority on your TRON account. It is ' +
                'used for signing transactions of TRON, such as transferring tokens,freezing and voting',
            {
                scale,
                x: margin + qrSize + 0.1,
                y: offset,
                lineHeight: lineHeight,
                maxWidth: maxLineWidth - (qrSize + 0.1),
                color: 'black',
                fontSize: 0.14,
                font: 'Roboto-Regular',
            }
        );

        offset += 0.075; // todo: replace tron private key
        offset += this.renderText(ctx, tron_private_key, {
            scale,
            x: margin + qrSize + 0.1,
            y: sectionStart + sectionHeight - 0.4,
            lineHeight: lineHeight,
            maxWidth: maxLineWidth,
            color: 'black',
            fontSize: 0.14,
            font: 'RobotoMono-Regular',
        });
        offset += 0.2;

        // todo: pass newUser
        if (!this.props.newUser) return ctx;

        // Steemit Account
        offset += 0.4;
        offset += this.renderText(ctx, 'Your Steemit Private Keys', {
            scale,
            x: margin,
            y: offset,
            lineHeight: lineHeight,
            maxWidth: maxLineWidth,
            color: 'black',
            fontSize: 0.18,
            font: 'Roboto-Bold',
        });
        offset += 0.1;
        // POSTING KEY

        sectionStart = offset;
        sectionHeight = qrSize + 0.15 * 2;
        this.drawFilledRect(ctx, 0.0, offset, widthInches, sectionHeight, {
            color: 'f4f4f4',
        });

        offset += 0.15;
        this.drawQr(
            ctx,
            'steem://import/wif/' +
                keys.postingPrivate +
                '/account/' +
                this.props.name,
            margin,
            offset,
            qrSize,
            '#f4f4f4'
        );

        offset += 0.1;
        offset += this.renderText(ctx, 'Private Posting Key', {
            scale,
            x: margin + qrSize + 0.1,
            y: offset,
            lineHeight: lineHeight,
            maxWidth: maxLineWidth,
            color: 'black',
            fontSize: 0.14,
            font: 'Roboto-Bold',
        });

        offset += this.renderText(
            ctx,
            'Used to log in to apps such as Steemit.com and perform social ' +
                'actions such as posting, commenting, and voting.',
            {
                scale,
                x: margin + qrSize + 0.1,
                y: offset,
                lineHeight: lineHeight,
                maxWidth: maxLineWidth - (qrSize + 0.1),
                color: 'black',
                fontSize: 0.14,
                font: 'Roboto-Regular',
            }
        );

        offset += 0.075;
        offset += this.renderText(ctx, keys.postingPrivate, {
            scale,
            x: margin + qrSize + 0.1,
            y: sectionStart + sectionHeight - 0.6,
            lineHeight: lineHeight,
            maxWidth: maxLineWidth,
            color: 'black',
            fontSize: 0.14,
            font: 'RobotoMono-Regular',
        });
        offset += 0.2;
        offset = sectionStart + sectionHeight;

        // MEMO KEY

        sectionStart = offset;
        sectionHeight = qrSize + 0.15 * 2;
        //this.drawFilledRect(ctx, 0.0, offset, widthInches, sectionHeight, {color: '#f4f4f4'});

        offset += 0.15;
        this.drawQr(
            ctx,
            'steem://import/wif/' +
                keys.memoPrivate +
                '/account/' +
                this.props.name,
            margin,
            offset,
            qrSize,
            '#ffffff'
        );

        offset += 0.1;

        offset += this.renderText(ctx, 'Private Memo Key', {
            scale,
            x: margin + qrSize + 0.1,
            y: offset,
            lineHeight: lineHeight,
            maxWidth: maxLineWidth,
            color: 'black',
            fontSize: 0.14,
            font: 'Roboto-Bold',
        });

        offset += this.renderText(
            ctx,
            'Used to decrypt private transfer memos.',
            {
                scale,
                x: margin + qrSize + 0.1,
                y: offset,
                lineHeight: lineHeight,
                maxWidth: maxLineWidth - (qrSize + 0.1),
                color: 'black',
                fontSize: 0.14,
                font: 'Roboto-Regular',
            }
        );

        offset += 0.075;
        offset += this.renderText(ctx, keys.memoPrivate, {
            scale,
            x: margin + qrSize + 0.1,
            y: sectionStart + sectionHeight - 0.6,
            lineHeight: lineHeight,
            maxWidth: maxLineWidth,
            color: 'black',
            fontSize: 0.14,
            font: 'RobotoMono-Regular',
        });

        offset += 0.1;
        offset = sectionStart + sectionHeight;

        // ACTIVE KEY

        sectionStart = offset;
        sectionHeight = qrSize + 0.15 * 2;
        this.drawFilledRect(ctx, 0.0, offset, widthInches, sectionHeight, {
            color: '#f4f4f4',
        });

        offset += 0.15;
        this.drawQr(
            ctx,
            'steem://import/wif/' +
                keys.activePrivate +
                '/account/' +
                this.props.name,
            margin,
            offset,
            qrSize,
            '#f4f4f4'
        );

        offset += 0.1;

        offset += this.renderText(ctx, 'Private Active Key', {
            scale,
            x: margin + qrSize + 0.1,
            y: offset,
            lineHeight: lineHeight,
            maxWidth: maxLineWidth,
            color: 'black',
            fontSize: 0.14,
            font: 'Roboto-Bold',
        });

        offset += this.renderText(
            ctx,
            'Used for monetary and wallet related actions, such as ' +
                'transferring tokens or powering STEEM up and down.',
            {
                scale,
                x: margin + qrSize + 0.1,
                y: offset,
                lineHeight: lineHeight,
                maxWidth: maxLineWidth - (qrSize + 0.1),
                color: 'black',
                fontSize: 0.14,
                font: 'Roboto-Regular',
            }
        );

        offset += 0.075;
        offset += this.renderText(ctx, keys.activePrivate, {
            scale,
            x: margin + qrSize + 0.1,
            y: sectionStart + sectionHeight - 0.6,
            lineHeight: lineHeight,
            maxWidth: maxLineWidth,
            color: 'black',
            fontSize: 0.14,
            font: 'RobotoMono-Regular',
        });
        // offset += 0.2;

        // offset = sectionStart + sectionHeight;
        // add a new page
        ctx.addPage('letter', 'portrait');
        offset = 0.2;

        // OWNER KEY
        sectionStart = offset;
        sectionHeight = qrSize + 0.15 * 2;
        // this.drawFilledRect(ctx, 0.0, offset, widthInches, sectionHeight, {color: '#f4f4f4'});

        offset += 0.15;
        this.drawQr(
            ctx,
            'steem://import/wif/' +
                keys.ownerPrivate +
                '/account/' +
                this.props.name,
            margin,
            offset,
            qrSize,
            '#ffffff'
        );

        offset += 0.1;

        offset += this.renderText(ctx, 'Private Owner Key', {
            scale,
            x: margin + qrSize + 0.1,
            y: offset,
            lineHeight: lineHeight,
            maxWidth: maxLineWidth - qrSize - 0.1,
            color: 'black',
            fontSize: 0.14,
            font: 'Roboto-Bold',
        });

        offset += this.renderText(
            ctx,
            'This key is used to reset all your other keys. It is ' +
                'recommended to keep it offline at all times. If your ' +
                'account is compromised, use this key to recover it ' +
                'within 30 days at https://steemitwallet.com.',
            {
                scale,
                x: margin + qrSize + 0.1,
                y: offset,
                lineHeight: lineHeight,
                maxWidth: maxLineWidth - (qrSize + 0.1),
                color: 'black',
                fontSize: 0.14,
                font: 'Roboto-Regular',
            }
        );

        offset += 0.075;
        offset += this.renderText(ctx, keys.ownerPrivate, {
            scale,
            x: margin + qrSize + 0.1,
            y: sectionStart + sectionHeight - 0.6,
            lineHeight: lineHeight,
            maxWidth: maxLineWidth - qrSize - 0.1,
            color: 'black',
            fontSize: 0.14,
            font: 'RobotoMono-Regular',
        });

        offset = sectionStart + sectionHeight;

        // MASTER PASSWORD

        sectionHeight = 1;
        sectionStart = offset;
        this.drawFilledRect(ctx, 0.0, offset, widthInches, sectionHeight, {
            color: '#f4f4f4',
        });

        offset += 0.2;
        offset += this.renderText(ctx, ['Master Password'].join(''), {
            scale,
            x: margin,
            y: offset,
            lineHeight: lineHeight,
            maxWidth: maxLineWidth,
            color: 'black',
            fontSize: 0.14,
            font: 'Roboto-Bold',
        });

        offset += this.renderText(
            ctx,
            'The seed password used to generate this document. ' +
                'Do not share this key.',
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

        offset += 0.075;
        offset += this.renderText(ctx, keys.master, {
            scale,
            x: margin,
            y: offset,
            lineHeight: lineHeight,
            maxWidth: maxLineWidth,
            color: 'black',
            fontSize: 0.14,
            font: 'RobotoMono-Regular',
        });

        offset = sectionStart + sectionHeight;

        // PUBLIC KEYS INTRO

        sectionStart = offset;
        sectionHeight = 1.0;
        //this.drawFilledRect(ctx, 0.0, offset, widthInches, sectionHeight, {color: '#f4f4f4'});

        offset += 0.1;
        offset += this.renderText(ctx, 'Your Steemit Public Keys', {
            scale,
            x: margin,
            y: offset,
            lineHeight: lineHeight,
            maxWidth: maxLineWidth,
            color: 'black',
            fontSize: 0.18,
            font: 'Roboto-Bold',
        });

        offset += 0.1;
        offset += this.renderText(
            ctx,
            'Public keys are associated with usernames and are used to ' +
                'encrypt and verify messages. Your public keys are not required ' +
                'for login. You can view these anytime at: https://steemscan.com/account/' +
                this.props.name,
            {
                scale,
                x: margin,
                y: offset,
                lineHeight: lineHeight,
                maxWidth: maxLineWidth,
                color: 'black',
                fontSize: 0.15,
                font: 'Roboto-Regular',
            }
        );

        offset = sectionStart + sectionHeight;

        // PUBLIC KEYS

        this.renderText(ctx, 'Posting Public', {
            scale,
            x: margin,
            y: offset,
            lineHeight: lineHeight,
            maxWidth: maxLineWidth,
            color: 'black',
            fontSize: 0.14,
            font: 'Roboto-Bold',
        });

        offset += this.renderText(ctx, keys.postingPublic, {
            scale,
            x: 1.25,
            y: offset,
            lineHeight: lineHeight,
            maxWidth: maxLineWidth,
            color: 'black',
            fontSize: 0.14,
            font: 'RobotoMono-Regular',
        });

        this.renderText(ctx, 'Memo Public', {
            scale,
            x: margin,
            y: offset,
            lineHeight: lineHeight,
            maxWidth: maxLineWidth,
            color: 'black',
            fontSize: 0.14,
            font: 'Roboto-Bold',
        });

        offset += this.renderText(ctx, keys.memoPublic, {
            scale,
            x: 1.25,
            y: offset,
            lineHeight: lineHeight,
            maxWidth: maxLineWidth,
            color: 'black',
            fontSize: 0.14,
            font: 'RobotoMono-Regular',
        });

        this.renderText(ctx, 'Active Public', {
            scale,
            x: margin,
            y: offset,
            lineHeight: lineHeight,
            maxWidth: maxLineWidth,
            color: 'black',
            fontSize: 0.14,
            font: 'Roboto-Bold',
        });

        offset += this.renderText(ctx, keys.activePublic, {
            scale,
            x: 1.25,
            y: offset,
            lineHeight: lineHeight,
            maxWidth: maxLineWidth,
            color: 'black',
            fontSize: 0.14,
            font: 'RobotoMono-Regular',
        });

        this.renderText(ctx, 'Owner Public', {
            scale,
            x: margin,
            y: offset,
            lineHeight: lineHeight,
            maxWidth: maxLineWidth,
            color: 'black',
            fontSize: 0.14,
            font: 'Roboto-Bold',
        });

        offset += this.renderText(ctx, keys.ownerPublic, {
            scale,
            x: 1.25,
            y: offset,
            lineHeight: lineHeight,
            maxWidth: maxLineWidth,
            color: 'black',
            fontSize: 0.14,
            font: 'RobotoMono-Regular',
        });

        this.renderText(ctx, 'v0.1', {
            scale,
            x: maxLineWidth - 0.2,
            y: offset - 0.2,
            lineHeight: lineHeight,
            maxWidth: maxLineWidth,
            color: '#bbbbbb',
            fontSize: 0.14,
            font: 'Roboto-Regular',
        });

        return ctx;
    }
}
