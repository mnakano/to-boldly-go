var express = require('express');
var router = express.Router();

var isAuthenticated = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/auth');
}

module.exports = function(passport){
	
	router.get('/', function(req, res){
		res.render('auth-login');
	});
	
	router.post('/login', passport.authenticate('login', {
		successRedirect : '/auth/home',
		failureRedirect : '/auth',
	}));
	
	router.get('/register', function(req, res){
		res.render('auth-register');
	});
	
	router.post('/register', passport.authenticate('register', {
		successRedirect : '/auth/home',
		failureRedirect : '/auth/register'
	}));
	
	router.get('/home', isAuthenticated, function(req, res){
		res.render('auth-home', {'user':req.user});
	});
	
	router.get('/logout', function(req, res){
		req.logout();
		res.redirect('/auth');
	});
	
	return router;
}