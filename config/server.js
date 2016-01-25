var fs = require('fs');

var config = {};

config.port = 3000;

config.privateKey = fs.readFileSync('./config/ssl/privateKey.pem');
config.certificate = fs.readFileSync('./config/ssl/certificate.pem');

//TODO create script to regenerate this
// This can really be anything you want. Set it as you please
config.secret = 'DDyuz1tDe3KgHbYIz4Cl';

config.domain = 'localhost';

module.exports = config;
