var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//assigning database
var mongoUtil = require('./db/mongoUtil');
mongoUtil.connectToDb();
var db = mongoUtil.getDb();

var app = express();

//assigning routes
var index = require('./routes/index');
var adminAlbumTags = require('./routes/adminAlbumTags');
var adminAlbums = require('./routes/adminAlbums');

function getNavBarCollection(collectionName){
	var collection = [];
	db.get(collectionName).find({}, {sort:{name:1}}, function(err, results){
		if(err){
			console.log('ERROR: ' + err);
		}
		for(i = 0; i < results.length; i++){
			collection.push(results[i]);
		}
	});
	return collection;
}

function setNavBarValues(req, res, next){
	if(!app.locals.regions){
		app.locals.regions = getNavBarCollection('regions');
	}
	if(!app.locals.categories){
		app.locals.categories = getNavBarCollection('categories');
	}
	next();
}

app.locals.title = 'To Boldly Go';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(setNavBarValues);

//configuring Passport for authentication
var passport = require('passport');
var expressSession = require('express-session');
app.use(expressSession({secret : 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());

var initPassport = require('./passport/init');
initPassport(passport);

var adminAuth = require('./routes/adminAuth')(passport);

//routes
app.use('/', index);
app.use('/adminAlbumTags', adminAlbumTags);
app.use('/adminAlbums', adminAlbums);
app.use('/adminAuth', adminAuth);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
