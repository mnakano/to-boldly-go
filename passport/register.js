var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport){
	passport.use('register', new LocalStrategy({
			passReqToCallback : true
		},
		function(req, username, password, done){
			var collection = req.db.get('user');
			collection.findOne({username:username}, function(err, user){
				if(err){
					console.log('Error in Registration: ' + err);
					return done(err);
				}
				if(user){
					console.log('User already exists with the name: ' + username);
					return done(null, false);
				} else {
					user = {
						'username' : username,
						'password' : createHash(password)
					}
					collection.insert(user, function(err, result){
						if(err){
							console.log('Error in saving user: ' + username);
							return done(null, false);
						}
						console.log('User Registration Successful: ' + username);
						return done(null, user);
					});
				}
			});
		})
	);
	
	var createHash = function(password){
		return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
	}
}