//Accepts a socket.io object for real-time updating and stuff, returns the Express app
module.exports = function(app, io){

//TODO pass in the socket.io object as a parameter
var config = require('./config/server');

var express = require('express'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    logger = require('morgan'),
    //csrf = require('csurf'),
    compression = require('compression'),
    session = require('express-session'),
    FileStore = require('session-file-store')(session);


app.use(logger('dev'));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({dest: './uploads'}).single('song'));
app.use(cookieParser(config.secret));

/* RECOMMENT FOR TESTING */
app.use(session({
    secret: config.secret,
    resave: false,
    saveUninitialized: false,
    rolling: true, //resets expiration time
    //TODO check that the time-to-live is reset whenver the user connects (it should)
    store: new FileStore({ttl: 3600}),
    cookie: {
        maxAge: 3600000
    }
}));
//NOTE because the API is used by AJAX/mobile apps, csrf wouldn't work (only protects on AJAX protected cookies)
//app.use(csrf());

var apiRoutes = require('./api/routes')(io);

//Dispatches API calls
app.use('/api', apiRoutes);

//Sends frontend code/data
app.use(express.static('client'));
app.use('/bower', express.static('bower_components'));
app.use('/semantic', express.static('semantic/out'));
app.use('/art', express.static('artwork'));
app.use('/socket.io.js', function(req, res, next){
    res.sendFile('socket.io.js', {root: './node_modules/socket.io-client/'});
});


return app;


};
