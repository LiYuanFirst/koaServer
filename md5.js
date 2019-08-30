const crypto = require('crypto');

let obj = crypto.createHash('md5');
obj.update('000000');
console.log(obj.digest('hex'))