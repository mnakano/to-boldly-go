var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt');

module.exports = function(passport){
	passport.use('login', new LocalStrategy({
			passReqToCallback : true
		},
		function(req, username, password, done){
			var collection = req.db.get('user');
			collection.findOne({username:username}, function(err, user){
				if(err){
					return done(err);
				}
				if(!user){
					console.log('User Not Found with username ' + username);
					return done(null, false);
				}
				if(!isValidPassword(user.password, password)){
					console.log('Invalid Password');
					return done(null, false);
				}
				req.app.locals.isAuthenticated = true;
				return done(null, user);
			});
		})
	);
	
	var isValidPassword = function(userPassword, password){
		return bCrypt.compareSync(password, userPassword);
	}
}