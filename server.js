const Koa = require('koa');
const Router = require('koa-router');
const static = require('koa-static');

let server = new Koa();
server.listen(8080);

let router = new Router();

router.use('/admin',async ctx=>{

});
router.use('/', async ctx=>{

});
router.use(/((\.jpg)|(\.png)|(\.gif))$/i,static('./static',{
    maxage:30*864000*1000
}));
router.use(/((\.js)|(\.jsx))$/i,static('./static',{
    maxage:1*864000*1000
}));
router.use(/((\.html)|(\.htm))$/i,static('./static',{
    maxage:30*864000*1000
}));
router.use('*',static('./static',{
    maxage:30*864000*1000
}));