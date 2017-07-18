var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//assigning database
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/toboldlygo');

var index = require('./routes/index');
var albumTags = require('./routes/albumTags');

var app = express();

function getNavBarCollection(collectionName){
	var collection = [];
	db.get(collectionName).find({}, {}, function(err, results){
		if(err){
			console.log('ERROR: ' + err);
		}
		for(i = 0; i < results.length; i++){
			collection.push(results[i].name);
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
	if(!app.locals.countries){
		app.locals.countries = getNavBarCollection('countries');
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

//Make the db accessible to the router
app.use(function(req, res, next){
	req.db = db;
	next();
});

app.use('/', index);
app.use('/albumTags', albumTags);

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
