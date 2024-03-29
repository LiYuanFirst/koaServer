const Router = require('koa-router');
const fs = require('await-fs');
const path = require('path');
let router = new Router();
const common = require('../../libs/common');


router.get('/login', async ctx => {
    const { HTTP_ROOT } = ctx.config;
    await ctx.render('admin/login', {
        HTTP_ROOT,
        errmsg: ctx.query.errmsg
    });
});
router.post('/login', async ctx => {
    let { username, password } = ctx.request.fields;
    const { HTTP_ROOT } = ctx.config;
    let admins = JSON.parse(await fs.readFile(
        path.resolve(__dirname, '../../admin.json')
    ));
    function findAdmin(username) {
        let a = null;
        admins.forEach(admin => {
            if (admin.username == username) a = admin
        });
        return a
    }
    if (!findAdmin(username)) {
        ctx.redirect(`${HTTP_ROOT}/admin/login?errmsg=${encodeURIComponent('用户不存在')}`);

    } else if (findAdmin(username).password != common.md5(ctx.config.ADMIN_PREFIX + password)) {
        ctx.redirect(`${HTTP_ROOT}/admin/login?errmsg=${encodeURIComponent('密码错误')}`);
    } else {
        ctx.session['admin'] = username;
        ctx.redirect(`${HTTP_ROOT}/admin/`);
    }


});


// 通过session判断是否登录,在此之前路由不做判断
router.all('*', async (ctx, next) => {
    const { HTTP_ROOT } = ctx.config;
    if (ctx.session['admin']) {
        await next();
    } else {

        ctx.redirect(`${HTTP_ROOT}/admin/login`);
    }
});
router.get('/', async ctx => {
    const { HTTP_ROOT } = ctx.config;
    ctx.redirect(`${HTTP_ROOT}/admin/banner`);
});
// 页面路由
router.get('/banner', async ctx => {
    const { HTTP_ROOT } = ctx.config;
    const table = 'banner_table';
    let datas = await ctx.db.query(`SELECT * FROM ${table}`);
    // ctx.body = datas;
    await ctx.render('admin/table', {
        HTTP_ROOT,
        datas,
        fields: [{
            title: '标题', name: 'title', type: 'text'
        }, {
            title: '图片', name: 'src', type: 'file'
        }, {
            title: '链接', name: 'href', type: 'text'
        }, {
            title: '序号', name: 'serial', type: 'number'
        }],
        type: 'view',
        action: `${HTTP_ROOT}/admin/banner`
    });
});

// 增加一条数据库数据
router.post('/banner', async ctx => {
    let { title, src, href, serial } = ctx.request.fields;
    const { HTTP_ROOT } = ctx.config;
    src = path.basename(src[0].path);
    await ctx.db.query('INSERT INTO banner_table (title, src, href, serial) VALUES(?,?,?,?)', [title, src, href, serial]);
    ctx.redirect(`${HTTP_ROOT}/admin/banner`);
});
// 删除一条数据库数据及上传的文件
// (通过get访问，成功后跳转页面)
router.get('/banner/delete/:id/', async ctx => {
    let { id } = ctx.params;
    const { HTTP_ROOT, UPLOAD_DIR } = ctx.config;
    let data = await ctx.db.query('SELECT * FROM banner_table WHERE ID=?', [id]);
    ctx.assert(data.length, 400, 'no data');
    let row = data[0];
    //删除文件
    await common.unlink(path.resolve(UPLOAD_DIR, row.src));
    // 删除数据库数据
    await ctx.db.query('DELETE FROM banner_table WHERE ID=?', [id]);
    ctx.redirect(`${HTTP_ROOT}/admin/banner`);

});

// 获取一条数据库数据(页面跳转)
router.get('/banner/modify/:id/', async ctx => {
    let { id } = ctx.params;
    const { HTTP_ROOT, UPLOAD_DIR } = ctx.config;
    let data = await ctx.db.query('SELECT * FROM banner_table WHERE ID=?', [id]);
    ctx.assert(data.length, 400, 'no data');
    let row = data[0];

    await ctx.render('admin/table',{
        HTTP_ROOT,
        fields: [{
            title: '标题', name: 'title', type: 'text'
        }, {
            title: '图片', name: 'src', type: 'file'
        }, {
            title: '链接', name: 'href', type: 'text'
        }, {
            title: '序号', name: 'serial', type: 'number'
        }],
        type: 'modify',
        action: `${HTTP_ROOT}/admin/banner/modify/${id}`,
        old_data: row
    });

});

// 查询一条数据库数据
router.get('/banner/get/:id/', async ctx => {
    let { id } = ctx.params;
    const { HTTP_ROOT, UPLOAD_DIR } = ctx.config;
    let row = await ctx.db.query('SELECT * FROM banner_table WHERE ID=?', [id]);
    ctx.assert(row.length, 400, 'no data');
    if(row.length==0){
        ctx.body = {err:1,msg: 'no data'}
    }else{
        ctx.body = { err: 0, msg: 'success', data: row[0]}
    }

});

// 修改一条数据库数据
router.post('/banner/modify/:id/', async ctx => {
    let { id } = ctx.params;
    let postData = ctx.request.fields;
    const { HTTP_ROOT, UPLOAD_DIR } = ctx.config;
    //获取数据库内该条数据
    let data = await ctx.db.query('SELECT * FROM banner_table WHERE ID=?', [id]);
    ctx.assert(data.length, 400, 'no data');

    let keys = ['title', 'href', 'serial'];
    let vals = [];

    keys.forEach(key=>{
        vals.push(postData[key]);
    });
    
    //对文件改变做判断处理
    let src_change = false;
    if(postData.src && postData.src.length && postData.src[0].size){
        src_change = true
    }

    if(src_change){
        keys.push('src');
        vals.push(path.basename(postData.src[0].path));
    }
    await ctx.db.query(`UPDATE banner_table SET ${
        keys.map(key=>(`${key}=?`)).join(',')
    } WHERE ID=?`,[...vals,id]);
    if(src_change){
        //删除文件
        await common.unlink(path.resolve(UPLOAD_DIR, data[0].src));
    }
    ctx.redirect(`${HTTP_ROOT}/admin/banner`);

});
module.exports = router.routes()