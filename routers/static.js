
/**设置各个静态文件路由缓存时间 */
const static = require('koa-static');

module.exports = function (router,options) {
    options = options||{};
    options.image = options.image || 30;
    options.script = options.script || 1;
    options.styles = options.styles || 30;
    options.html = options.html || 30;
    options.other = options.other || 7;
    router.all(/((\.jpg)|(\.png)|(\.gif))$/i, static('./static', {
        maxage: options.image * 864000 * 1000
    }));
    router.all(/((\.js)|(\.jsx))$/i, static('./static', {
        maxage: options.script * 864000 * 1000
    }));
    router.all(/(\.css)$/i, static('./static', {
        maxage: options.styles * 864000 * 1000
    }));
    router.all(/((\.html)|(\.htm))$/i, static('./static', {
        maxage: options.html * 864000 * 1000
    }));
    router.all('*', static('./static', {
        maxage: options.other * 864000 * 1000
    }));
}