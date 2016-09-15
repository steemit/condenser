import koa_router from 'koa-router';
import koa_body from 'koa-body';
import request from 'co-request';
import Stripe from 'stripe';
import React from 'react';
import { renderToString } from 'react-dom/server';
import models from 'db/models';
import {esc, escAttrs} from 'db/models';
import ServerHTML from '../server-html';
import Icon from 'app/components/elements/Icon.jsx';
import sendEmail from '../sendEmail';
import {checkCSRF} from '../utils';
import config from '../../config';
import Iso from 'iso';

const stripe = Stripe(config.stripe.secret_key);

const assets_file = process.env.NODE_ENV === 'production' ? 'tmp/webpack-stats-prod.json' : 'tmp/webpack-stats-dev.json';
const assets = Object.assign({}, require(assets_file), {script: []});
assets.script.push('https://js.stripe.com/v2/');
assets.script.push('https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js');
assets.script.push('/static/credit_card.js');

const header = <header className="Header">
    <div className="Header__top header">
        <div className="expanded row">
            <div className="columns">
                <ul className="menu">
                    <li className="Header__top-logo">
                        <a href="/"><Icon name="steem" size="2x" /></a>
                    </li>
                    <li className="Header__top-steemit show-for-medium"><a href="/">steemit<span className="beta">beta</span></a></li>
                </ul>
            </div>
        </div>
    </div>
</header>;

function renderPage(content) {
    const body = renderToString(<div className="App">
        {header}
        <br />
        <div className="row">
            {content}
        </div>
    </div>);
    const props = { body: Iso.render(body, {stripe_key: config.stripe.publishable_key}), title: 'Credit Card Details', assets, meta: [] };
    return '<!DOCTYPE html>' + renderToString(<ServerHTML { ...props } />);
}

function renderCreditCardForm(csrf, error) {
    return <form className="column small-12 medium-10 large-7" id="credit-card-form" action="/credit_card" method="POST">
        <input type="hidden" name="csrf" value={csrf} />
        <div className="row">
            <div className="column">
                Please enter your credit card details below.<br />
                <span className="secondary">This information allows Steemit...</span>
            </div>
        </div>
        <hr />
        <div className="row">
            <div className="small-3 columns">
                <label htmlFor="card-holder-name" className="text-right middle">Name on Card</label>
            </div>
            <div className="small-9 columns">
                <input type="text" name="card-holder-name" id="card-holder-name" placeholder="Card Holder's Name" />
            </div>
        </div>
        <div className="row">
            <div className="small-3 columns">
                <label htmlFor="card-number" className="text-right middle">Card Number</label>
            </div>
            <div className="small-9 columns">
                <input type="text" name="card-number" id="card-number" placeholder="Debit/Credit Card Number" />
            </div>
        </div>
        <div className="row">
            <div className="small-3 columns">
                <label htmlFor="expiry-month" className="text-right middle">Expiration Date</label>
            </div>
            <div className="small-5 columns">
                <select name="expiry-month" id="expiry-month">
                    <option>Month</option>
                    <option value="01">Jan (01)</option>
                    <option value="02">Feb (02)</option>
                    <option value="03">Mar (03)</option>
                    <option value="04">Apr (04)</option>
                    <option value="05">May (05)</option>
                    <option value="06">June (06)</option>
                    <option value="07">July (07)</option>
                    <option value="08">Aug (08)</option>
                    <option value="09">Sep (09)</option>
                    <option value="10">Oct (10)</option>
                    <option value="11">Nov (11)</option>
                    <option value="12">Dec (12)</option>
                </select>
            </div>
            <div className="small-4 columns">
                <select name="expiry-year" id="expiry-year">
                    <option value="16">2016</option>
                    <option value="17">2017</option>
                    <option value="18">2018</option>
                    <option value="19">2019</option>
                    <option value="20">2020</option>
                    <option value="21">2021</option>
                    <option value="22">2022</option>
                    <option value="23">2023</option>
                </select>
            </div>
        </div>
        <div className="row">
            <div className="small-3 columns">
                <label htmlFor="cvv" className="text-right middle">Card CVV</label>
            </div>
            <div className="small-3 columns">
                <input type="text" name="cvv" id="cvv" placeholder="Security Code" />
            </div>
        </div>
        <div className="row">
            <div className="small-12 columns">
                <div id="form-errors" className="error">{error}</div>
            </div>
        </div>
        <div className="row">
            <div className="small-12 columns">
                <input type="submit" id="submit-btn" className="button float-right" value="Pay and Continue" />
            </div>
        </div>
    </form>;
}

function stripeCharge(card, amount) {
    return new Promise((resolve, reject) => {
        stripe.charges.create({card, currency: 'usd', amount},
            (err, charge) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(charge);
                }
            }
        );
    });
}

export default function useCreditCardForm(app) {
    const router = koa_router();
    app.use(router.routes());
    const koaBody = koa_body();

    router.get('/credit_card', function *() {
        console.log('-- /credit_card -->', this.session.uid, this.session.user);
        const user_id = this.session.user;
        if (!user_id) { this.body = 'user not found'; return; }
        const cid = yield models.Identity.findOne(
            {attributes: ['id'], where: {user_id, provider: 'credit_card'}}
        );
        if (cid) {
            const content = <div className="column">
                <p>We have determined that your you already used credit card verification.</p>
                <a href="/create_account" className="button">Continue</a>
            </div>;
            this.body = renderPage(content);
            return;
        }
        this.body = renderPage(renderCreditCardForm(this.csrf, ''));
    });

    router.post('/credit_card', koaBody, function *() {
        if (!checkCSRF(this, this.request.body.csrf)) return;
        const user_id = this.session.user;
        if (!user_id) { this.body = 'user not found'; return; }

        let stripe_res;
        try {
            stripe_res = yield stripeCharge(this.request.body.stripeToken, 100);
        } catch (err) {
            console.log('---> charge error:', err);
            this.body = renderPage(renderCreditCardForm(this.csrf, err.raw.message));
            return;
        }
        const card = stripe_res.card;
        console.log('-- POST /credit_card -->', this.session.uid, this.session.user, card);
        const cid = yield models.Identity.findOne(
            {attributes: ['id'], where: {provider: 'credit_card', provider_user_id: card.fingerprint}}
        );
        if (cid) {
            const content = <div className="column">
                <p>This card was already used.</p>
                <a href="/create_account" className="button">Continue</a>
            </div>;
            this.body = renderPage(content);
            return;
        }
        yield models.Identity.create({
            provider: 'credit_card',
            user_id,
            uid: this.session.uid,
            name: card.name,
            provider_user_id: card.fingerprint,
            verified: false, // is used here to determine if it was used to credit user's account
        });

        const content = <div className="column">
            <h4>Congratulations, your identity has been verified.</h4>
            <p>Your account will be credited with $50 worth of SP.</p>
            <a href="/create_account" className="button">Continue</a>
        </div>;
        this.body = renderPage(content);
    });
}
