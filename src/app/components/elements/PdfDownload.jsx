import React, { Component } from 'react';
import QRCode from 'qrcode.react';
import { PrivateKey } from '@steemit/steem-js/lib/auth/ecc';

export default class PdfDownload extends Component {
    constructor(props) {
        super(props);
        this.downloadPdf = this.downloadPdf.bind(this);
        this.kinds = ['active', 'owner', 'posting', 'memo'];
        this.pairs = [
            ['master', 'Master'],
            ['active-public', 'Active Public'],
            ['active-private', 'Active Private'],
            ['owner-public', 'Owner Public'],
            ['owner-private', 'Owner Private'],
            ['posting-public', 'Posting Public'],
            ['posting-private', 'Posting Private'],
            ['memo-public', 'Memo Public'],
            ['memo-private', 'Memo Private'],
        ];
    }

    // Generate the canvas, which will be generated into a PDF
    async componentDidMount() {
        // Load jsPDF. It does not work with webpack, so it must be loaded here.
        // On the plus side, it is only loaded when the warning page is shown.
        await new Promise((res, rej) => {
            const s = document.createElement('script');
            s.type = 'text/javascript';
            s.id = 'js-pdf';
            s.src =
                'https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.debug.js';
            s.integrity =
                'sha384-NaWTHo/8YCBYJ59830LTz/P4aQZK1sS0SneOgAvhsIl3zBu8r9RevNg5lHCHAuQ/';
            s.crossOrigin = 'anonymous';
            document.body.appendChild(s);
            s.addEventListener('load', res);
        });

        // Load WebFont, which allows us to load the subsequent fonts and know
        // when they're done loading.
        await new Promise((res, rej) => {
            const s = document.createElement('script');
            s.type = 'text/javascript';
            s.id = 'webfont';
            s.src =
                'https://ajax.googleapis.com/ajax/libs/webfont/1.6.16/webfont.js';
            s.integrity =
                'sha384-0bIyOfFEbXDmR9pWVT6PKyzSRIx8gTXuOsrfXQA51wfXn3LRXt+ih6riwq9Zv2yn';
            s.crossOrigin = 'anonymous';
            document.body.appendChild(s);
            s.addEventListener('load', res);
        });

        // Finally, load the fonts.
        await new Promise((res, rej) => {
            window.WebFont.load({
                google: {
                    families: ['Roboto', 'Roboto Mono'],
                },
                active: res,
            });
        });

        // Render the canvas.
        this.renderPdf();
    }

    render() {
        return (
            <div className="pdf-download">
                <QRCode
                    className="recovery-url"
                    style={{ display: 'none' }}
                    value="https://steemitwallet.com/recover_account_step_1"
                    size={this.props.qrSize * this.props.scale}
                />
                <canvas
                    className="rendered"
                    style={{
                        display: this.props.showCanvas ? 'initial' : 'none',
                        border: '1px solid #ddd',
                    }}
                    width={this.props.widthInches * this.props.scale}
                    height={this.props.heightInches * this.props.scale}
                />
                <button
                    style={{ display: 'block' }}
                    onClick={e => {
                        this.downloadPdf();
                        e.preventDefault();
                    }}
                >
                    {this.props.label}
                </button>
            </div>
        );
    }

    // Generate a list of public and private keys from a master password
    generateKeys(name, password) {
        return this.kinds.reduce(
            (accum, kind, i) => {
                const rawKey = PrivateKey.fromSeed(`${name}${kind}${password}`);
                accum[`${kind}Private`] = rawKey.toString();
                accum[`${kind}Public`] = rawKey.toPublicKey().toString();
                return accum;
            },
            { master: password }
        );
    }

    // Generate and download a PDF from the canvas
    downloadPdf() {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'in',
            format: 'letter',
        });

        const master = document.querySelector('.rendered');
        doc.addImage(
            master,
            'JPEG',
            0,
            0,
            this.props.widthInches,
            this.props.heightInches
        );
        doc.save('keys.pdf');
    }

    async renderPdf() {
        const keys = this.generateKeys(this.props.name, this.props.password);
        const canvas = document.querySelector('.rendered');
        const ctx = canvas.getContext('2d');
        const scale = this.props.scale;
        const lineHeight = 1.2;
        const widthInches = this.props.widthInches;

        this.clearCanvas(ctx, canvas);

        let offset = 0.0;

        this.drawFilledRect(ctx, 0.0, 0.0, widthInches, 1.29, {
            scale,
            color: '#1f0fd1',
        });

        await this.drawImage(
            ctx,
            '/images/pdf-logo.svg',
            widthInches - 0.2 - 1.9,
            0.36,
            0.98 * 1.8,
            0.3 * 1.8,
            { scale }
        );

        this.renderText(ctx, `Steem keys for @${this.props.name}`, {
            scale,
            x: 0.2,
            y: 0.265,
            lineHeight: 1.0,
            maxWidth: widthInches - 0.2 * 2.0,
            color: 'white',
            fontSize: 0.36,
            fontFamily: 'Roboto',
            decoration: 'bold',
        });

        this.renderText(
            ctx,
            'Your recovery account partner: Steemitwallet.com',
            {
                scale,
                x: 0.2,
                y: 0.745,
                lineHeight: 1.0,
                maxWidth: widthInches - 0.2 * 2.0,
                color: 'white',
                fontSize: 0.18,
                fontFamily: 'Roboto',
                decoration: 'bold',
            }
        );

        this.renderText(
            ctx,
            [
                `Steemit.com is powered by Steem and uses its hierarchical key system to keep you and your tokens safe. Print this out and keep it somewhere safe. When in doubt, use your Private Posting Key as your password, not your Master Password which is only intended to be used to change your private keys. You can also view these anytime at steemd.com/${
                    this.props.name
                }`,
            ].join(''),
            {
                scale,
                x: 0.2,
                y: 1.5,
                lineHeight: lineHeight,
                maxWidth: widthInches - 0.2 * 2.0,
                color: 'black',
                fontSize: 0.14,
                fontFamily: 'Roboto',
                decoration: null,
            }
        );

        offset += 2.25;

        this.drawFilledRect(ctx, 0.0, offset, widthInches, 1.03, {
            scale,
            color: '#f4f4f4',
        });

        this.renderText(ctx, ['Master Password'].join(''), {
            scale,
            x: 0.2,
            y: 0.2 + offset,
            lineHeight: lineHeight,
            maxWidth: widthInches - 0.2 * 2.0,
            color: 'black',
            fontSize: 0.14,
            fontFamily: 'Roboto',
            decoration: 'bold',
        });

        this.renderText(
            ctx,
            [
                `The seed used to generate all of your other Steem keys. You can `,
                `reset this at steemitwallet.com/@${this.props.name}/password`,
            ].join(''),
            {
                scale,
                x: 0.2,
                y: 0.2 + 0.14 * lineHeight + offset,
                lineHeight: lineHeight,
                maxWidth: widthInches - 0.2 * 2.0,
                color: 'black',
                fontSize: 0.14,
                fontFamily: 'Roboto',
            }
        );

        this.renderText(ctx, keys.master, {
            scale,
            x: 0.2,
            y: 0.2 + 0.36 * lineHeight + offset,
            lineHeight: lineHeight,
            maxWidth: widthInches - 0.2 * 2.0,
            color: 'black',
            fontSize: 0.14,
            fontFamily: 'Roboto Mono',
        });

        offset += 1.08;

        this.renderText(ctx, 'Your Private Keys', {
            scale,
            x: 0.2,
            y: 0.14 * lineHeight + offset,
            lineHeight: lineHeight,
            maxWidth: widthInches - 0.2 * 2.0,
            color: 'black',
            fontSize: 0.18,
            fontFamily: 'Roboto',
            decoration: 'bold',
        });

        this.renderText(
            ctx,
            [
                `Each Steem Key has a public and private key to encrypt and decrypt `,
                `data. Private Keys are required to login or authenticate `,
                `transactions.`,
            ].join(''),
            {
                scale,
                x: 0.2,
                y: 0.41 * lineHeight + offset,
                lineHeight: lineHeight,
                maxWidth: widthInches - 0.2 * 2.0,
                color: 'black',
                fontSize: 0.14,
                fontFamily: 'Roboto',
            }
        );

        offset += 0.64 * lineHeight;

        this.drawFilledRect(ctx, 0.0, offset + 0.2, widthInches, 1.4, {
            scale,
            color: '#f4f4f4',
        });

        this.drawImageFromSelector(
            ctx,
            '.recovery-url',
            0.2,
            offset + 0.45,
            this.props.qrSize,
            this.props.qrSize,
            { scale }
        );

        this.renderText(ctx, ['Private Owner Key'].join(''), {
            scale,
            x: 1.3,
            y: offset + 0.45,
            lineHeight: lineHeight,
            maxWidth: widthInches - 1.5,
            color: 'black',
            fontSize: 0.14,
            fontFamily: 'Roboto',
            decoration: 'bold',
        });

        this.renderText(
            ctx,
            [
                `If your account is stolen, use this key to recover your account `,
                `within 30 days at steemitwallet.com/recovery_account_step_1 or scan `,
                `the QR code to the left. This key can also be used to change your `,
                `other keys.`,
            ].join(''),
            {
                scale,
                x: 1.3,
                y: offset + 0.45 + 0.14 * lineHeight,
                lineHeight: lineHeight,
                maxWidth: widthInches - 1.5,
                color: 'black',
                fontSize: 0.14,
                fontFamily: 'Roboto',
            }
        );

        this.renderText(ctx, keys.ownerPrivate, {
            scale,
            x: 1.3,
            y: offset + 0.45 + 0.14 * lineHeight + 0.57,
            lineHeight: lineHeight,
            maxWidth: widthInches - 1.5,
            color: 'black',
            fontSize: 0.14,
            fontFamily: 'Roboto Mono',
        });

        offset += 0.41 + 0.14 * lineHeight + 0.65 + 0.36;

        this.drawStrokedRect(ctx, 0.0, offset, widthInches, 1.01, {
            scale,
            color: '#f4f4f4',
            lineWidth: 1.0,
        });

        this.renderText(ctx, ['Private Active Key'].join(''), {
            scale,
            x: 0.2,
            y: offset + 0.2,
            lineHeight: lineHeight,
            maxWidth: widthInches - 0.2 * 2.0,
            color: 'black',
            fontSize: 0.14,
            fontFamily: 'Roboto',
            decoration: 'bold',
        });

        this.renderText(
            ctx,
            [
                `Use for monetary / wallet related actions, like transferring tokens `,
                `or powering up and down.`,
            ].join(''),
            {
                scale,
                x: 0.2,
                y: offset + 0.2 + 0.14 * lineHeight,
                lineHeight: lineHeight,
                maxWidth: widthInches - 0.2 * 2.0,
                color: 'black',
                fontSize: 0.14,
                fontFamily: 'Roboto',
            }
        );

        this.renderText(ctx, keys.activePrivate, {
            scale,
            x: 0.2,
            y: offset + 0.2 + 0.34 * lineHeight,
            lineHeight: lineHeight,
            maxWidth: widthInches - 0.2 * 2.0,
            color: 'black',
            fontSize: 0.14,
            fontFamily: 'Roboto Mono',
        });

        offset += 1.01;

        this.drawFilledRect(ctx, 0.0, offset, widthInches, 1.01, {
            scale,
            color: '#f4f4f4',
        });

        this.renderText(ctx, ['Private Posting Key'].join(''), {
            scale,
            x: 0.2,
            y: offset + 0.2,
            lineHeight: lineHeight,
            maxWidth: widthInches - 0.2 * 2.0,
            color: 'black',
            fontSize: 0.14,
            fontFamily: 'Roboto',
            decoration: 'bold',
        });

        this.renderText(
            ctx,
            [
                `Use to log in to Steemit.com and do social networking actions, like `,
                `posting, commenting and voting.`,
            ].join(''),
            {
                scale,
                x: 0.2,
                y: offset + 0.2 + 0.14 * lineHeight,
                lineHeight: lineHeight,
                maxWidth: widthInches - 0.2 * 2.0,
                color: 'black',
                fontSize: 0.14,
                fontFamily: 'Roboto',
            }
        );

        this.renderText(ctx, keys.postingPrivate, {
            scale,
            x: 0.2,
            y: offset + 0.2 + 0.34 * lineHeight,
            lineHeight: lineHeight,
            maxWidth: widthInches - 0.2 * 2.0,
            color: 'black',
            fontSize: 0.14,
            fontFamily: 'Roboto Mono',
        });

        offset += 1.01;

        this.drawStrokedRect(ctx, 0.0, offset, widthInches, 1.01, {
            scale,
            color: '#f4f4f4',
            lineWidth: 1.0,
        });

        this.renderText(ctx, 'Private Memo Key', {
            scale,
            x: 0.2,
            y: offset + 0.2,
            lineHeight: lineHeight,
            maxWidth: widthInches - 0.2 * 2.0,
            color: 'black',
            fontSize: 0.14,
            fontFamily: 'Roboto',
            decoration: 'bold',
        });

        this.renderText(ctx, 'Use to encrypt and decrypt private messages.', {
            scale,
            x: 0.2,
            y: offset + 0.2 + 0.14 * lineHeight,
            lineHeight: lineHeight,
            maxWidth: widthInches - 0.2 * 2.0,
            color: 'black',
            fontSize: 0.14,
            fontFamily: 'Roboto',
        });

        this.renderText(ctx, keys.memoPrivate, {
            scale,
            x: 0.2,
            y: offset + 0.2 + 0.36 * lineHeight,
            lineHeight: lineHeight,
            maxWidth: widthInches - 0.2 * 2.0,
            color: 'black',
            fontSize: 0.14,
            fontFamily: 'Roboto Mono',
        });

        offset += 1.01;

        this.drawFilledRect(ctx, 0.0, offset, widthInches, 1.01, {
            scale,
            color: '#f4f4f4',
        });

        this.renderText(ctx, 'Your Public Keys', {
            scale,
            x: 0.2,
            y: 0.15 * lineHeight + offset,
            lineHeight: lineHeight,
            maxWidth: widthInches - 0.2 * 2.0,
            color: 'black',
            fontSize: 0.18,
            fontFamily: 'Roboto',
            decoration: 'bold',
        });

        this.renderText(
            ctx,
            [
                `Public keys are associated with usernames and can be used to look up `,
                `associated transactions on the blockchain. Your public keys are not `,
                `required for login.`,
            ].join(''),
            {
                scale,
                x: 0.2,
                y: 0.42 * lineHeight + offset,
                lineHeight: lineHeight,
                maxWidth: widthInches - 0.2 * 2.0,
                color: 'black',
                fontSize: 0.15,
                fontFamily: 'Roboto',
            }
        );

        offset += 0.66 * lineHeight;
        offset += 0.35 * lineHeight;

        this.renderText(ctx, 'Owner Public', {
            scale,
            x: 0.2,
            y: offset,
            lineHeight: lineHeight,
            maxWidth: widthInches - 0.2 * 2.0,
            color: 'black',
            fontSize: 0.14,
            fontFamily: 'Roboto',
            decoration: 'bold',
        });

        this.renderText(ctx, keys.ownerPublic, {
            scale,
            x: 1.25,
            y: offset,
            lineHeight: lineHeight,
            maxWidth: widthInches - 0.2 * 2.0,
            color: 'black',
            fontSize: 0.14,
            fontFamily: 'Roboto Mono',
        });

        offset += 0.18 * lineHeight;

        this.renderText(ctx, 'Active Public', {
            scale,
            x: 0.2,
            y: offset,
            lineHeight: lineHeight,
            maxWidth: widthInches - 0.2 * 2.0,
            color: 'black',
            fontSize: 0.14,
            fontFamily: 'Roboto',
            decoration: 'bold',
        });

        this.renderText(ctx, keys.activePublic, {
            scale,
            x: 1.25,
            y: offset,
            lineHeight: lineHeight,
            maxWidth: widthInches - 0.2 * 2.0,
            color: 'black',
            fontSize: 0.14,
            fontFamily: 'Roboto Mono',
        });

        offset += 0.18 * lineHeight;

        this.renderText(ctx, 'Posting Public', {
            scale,
            x: 0.2,
            y: offset,
            lineHeight: lineHeight,
            maxWidth: widthInches - 0.2 * 2.0,
            color: 'black',
            fontSize: 0.14,
            fontFamily: 'Roboto',
            decoration: 'bold',
        });

        this.renderText(ctx, keys.postingPublic, {
            scale,
            x: 1.25,
            y: offset,
            lineHeight: lineHeight,
            maxWidth: widthInches - 0.2 * 2.0,
            color: 'black',
            fontSize: 0.14,
            fontFamily: 'Roboto Mono',
        });

        offset += 0.18 * lineHeight;

        this.renderText(ctx, 'Memo Public', {
            scale,
            x: 0.2,
            y: offset,
            lineHeight: lineHeight,
            maxWidth: widthInches - 0.2 * 2.0,
            color: 'black',
            fontSize: 0.14,
            fontFamily: 'Roboto',
            decoration: 'bold',
        });

        this.renderText(ctx, keys.memoPublic, {
            scale,
            x: 1.25,
            y: offset,
            lineHeight: lineHeight,
            maxWidth: widthInches - 0.2 * 2.0,
            color: 'black',
            fontSize: 0.14,
            fontFamily: 'Roboto Mono',
        });
    }

    loadImage(src) {
        return new Promise((res, rej) => {
            const img = new Image();
            img.onload = () => res(img);
            img.onerror = rej;
            img.src = src;
        });
    }

    wrapText(ctx, text, maxWidth) {
        let words = text.split(' ');
        let lines = [];
        let currentLine = words[0];
        for (let i = 1; i < words.length; i++) {
            let word = words[i];
            let width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    renderText(
        ctx,
        text,
        {
            scale,
            x,
            y,
            lineHeight,
            maxWidth,
            color,
            fontSize,
            fontFamily,
            decoration,
        }
    ) {
        ctx.fillStyle = color;
        ctx.font = `${decoration || ''} ${fontSize * scale}px ${fontFamily}`;
        const wrappedText = this.wrapText(ctx, text, maxWidth * scale);
        const baseY = y * scale;
        const offsetY = fontSize * scale;
        for (let i in wrappedText) {
            const lineOffsetY = i * fontSize * lineHeight * scale;
            ctx.fillText(
                wrappedText[i],
                x * scale,
                baseY + offsetY + lineOffsetY
            );
        }
    }

    clearCanvas(ctx, canvas) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0.0, 0.0, canvas.width, canvas.height);
    }

    drawFilledRect(ctx, x, y, w, h, { scale, color }) {
        ctx.fillStyle = color;
        ctx.fillRect(x * scale, y * scale, w * scale, h * scale);
    }

    drawStrokedRect(ctx, x, y, w, h, { scale, color, lineWidth }) {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.strokeRect(x * scale, y * scale, w * scale, h * scale);
    }

    async drawImage(ctx, url, x, y, w, h, { scale }) {
        const img = await this.loadImage(url);
        ctx.drawImage(img, x * scale, y * scale, w * scale, h * scale);
    }

    drawImageFromSelector(ctx, selector, x, y, w, h, { scale }) {
        ctx.drawImage(
            document.querySelector(selector),
            x * scale,
            y * scale,
            w * this.props.scale,
            h * this.props.scale
        );
    }
}
