const Koa = require('koa');
const Router = require('koa-router');
const static = require('./routers/static');
const body = require('koa-better-body');
const path = require('path');
const session = require('koa-session');
const fs = require('fs');
const ejs = require('koa-ejs');


let server = new Koa();
server.listen(8080);

// 中间件
server.use(body({
    uploadDir: path.resolve('./static/upload')
}))

//读取.keys文件作为session秘钥
server.keys = fs.readFileSync('.keys').toString().split('\n');
server.use(session({
    maxAge:20*60*1000,//有效时间
    renew: true //自动续期
},server));

//连接数据库
server.context.db = require('./libs/database');


//渲染用ejs
ejs(server,{
    root: path.resolve(__dirname,'template'),
    layout:false,
    viewExt: 'ejs',
    cache: false,
    debug: false
})

// 配置路由
let router = new Router();
// 统一验证请求报错
router.use(async (ctx,next)=>{
    try {
        await next();
    } catch (error) {
        // ctx.state = 500;
        // ctx.body = 'error';
        ctx.throw(500,'Internal Server Error');
    }
});



router.use('/admin',require('./routers/admin'));
router.use('', require('./routers/www'));
server.use(router.routes())

// 配置文件缓存时间
static(router,{html:1});

server.use(router.routes())