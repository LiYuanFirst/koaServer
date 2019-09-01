const path = require('path');
module.exports = {
    DB_HOST: 'localhost',
    DB_USER: 'root',
    DB_PASS: '',
    DB_NAME: '20190827',

    PORT:8080,
    ADMIN_PREFIX: 'dhsjhd,./(:',//密码后缀
    HTTP_ROOT: 'http://localhost:8080',
    UPLOAD_DIR: path.resolve('./static/upload')
}