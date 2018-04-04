import koa_router from 'koa-router'
import koa_body from 'koa-body'
import serverConfig from 'config'
import { config, broadcast } from 'golos-js'
import { createAccount  } from './api/general'

config.set('chain_id',serverConfig.get('chain_id'))

export default function useTestnetApi(app) {
    const router = koa_router({prefix: '/api/v1'})
    app.use(router.routes())
    const koaBody = koa_body()

    router.post('/create_account_testnet', koaBody, function *() {
        const params = this.request.body
        const account = typeof(params) === 'string' ? JSON.parse(params) : params

        try {          
            yield createAccount({
                signingKey: serverConfig.get('registrar.signing_key'),
                fee: serverConfig.get('registrar.fee'),
                creator: serverConfig.get('registrar.account'),
                new_account_name: account.name,
                owner: account.owner_key,
                active: account.active_key,
                posting: account.posting_key,
                memo: account.memo_key
            })

            this.body = JSON.stringify({status: 'ok'})
        } catch (e) {
            this.body = JSON.stringify({error: e.message})
            this.status = 500;
        }
    })
}