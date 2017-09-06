var express = require('express');
var router = express.Router();

var isAuthenticated = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/adminAuth');
}

module.exports = function(passport){
	
	router.get('/', function(req, res){
		res.render('admin-login');
	});
	
	router.post('/login', passport.authenticate('login', {
		successRedirect : '/adminAuth/home',
		failureRedirect : '/',
	}));
	
	router.get('/home', isAuthenticated, function(req, res){
		res.render('admin-home', {'user':req.user});
	});
	
	router.get('/register', isAuthenticated, function(req, res){
		res.render('admin-register');
	});
	
	router.post('/register', isAuthenticated, passport.authenticate('register', {
		successRedirect : '/adminAuth/home',
		failureRedirect : '/adminAuth/register'
	}));
	
	router.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	});
	
	return router;
}