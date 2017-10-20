var login = require('./login');
var register = require('./register');

//assigning database
var mongoUtil = require('../db/mongoUtil');
mongoUtil.connectToDb();
var db = mongoUtil.getDb();

module.exports = function(passport){
	passport.serializeUser(function(user, done){
		console.log('seriealzing user: ' + user);
		done(null, user._id);
	});
	
	passport.deserializeUser(function(id, done){
		var collection = db.get('user');
		collection.findOne({_id:id}, function(err, user){
			console.log('deserializing user: ' + user);
			done(err, user);
		});
	});
	
	login(passport);
	register(passport);
}