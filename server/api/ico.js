import koa_router from 'koa-router';
import koa_body from 'koa-body';
import models from 'db/models';
import config from 'config';
import findUser from 'db/utils/find_user';
import request from 'request'
import {getLogger} from '../../app/utils/Logger'

let print = getLogger('ico route').print

export default function useIcoApi(app) {
    const router = koa_router();
    app.use(router.routes());
    const koaBody = koa_body();

    router.get('/test_meow', function *(){
        print ('hi there', this);
        this.status = 200;
        this.body = JSON.stringify({'hello': 'ok'});
    });
}
