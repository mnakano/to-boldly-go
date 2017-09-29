var express = require('express');
var async = require('async');
var router = express.Router();
var dbTask = require('../support-modules/dbTask');
var finalTask = require('../support-modules/finalTask');

/* GET home page. */
router.get('/', function(req, res) {
	async.waterfall([
		function(callback){
			var options = {sort : {publishedDate : -1}, limit : 8};
			dbTask.findMany('album', null, options, callback);
		}
	], function(err, results, message){
		finalTask.render(err, res, 'albums', results, message, 'index');
	});
});

router.get('/region/:region', function(req, res, next) {
	async.waterfall([
		function(callback){
			var keys = {region : req.params.region.split('-').join(' ')};
			var options = {sort : {albumDate : -1}};
			dbTask.findMany('album', keys, options, callback);
		}
	], function(err, results, message){
		finalTask.render(err, res, req.params.region, results, message, 'album-list')
	});
});

router.get('/category/:category', function(req, res, next) {
	async.waterfall([
		function(callback){
			var keys = {albumCategory : req.params.category.split('-').join(' ')};
			var options = {sort : {albumDate : -1}};
			dbTask.findMany('album', keys, options, callback);
		}
	], function(err, results, message){
		finalTask.render(err, res, req.params.category, results, message, 'album-list')
	});
});

router.get('/country/:country', function(req, res, next) {
	async.waterfall([
		function(callback){
			var keys = {country : req.params.country.split('-').join(' ')};
			var options = {sort : {albumDate : -1}};
			dbTask.findMany('album', keys, options, callback);
		}
	], function(err, results, message){
		finalTask.render(err, res, req.params.country, results, message, 'album-list')
	});
});

router.get('/search', function(req, res, next){
	var search = req.query['search'];
	async.waterfall([
		function(callback){
			var keys = {$text:{$search:search}};
			var options = {sort : {publishedDate : -1}};
			dbTask.findMany('album', keys, options, callback);
		}
	], function(err, results, message){
		finalTask.render(err, res, search, results, message, 'album-list', true)
	});
});

router.get('/album/:title', function(req, res){
	var title = req.params.title.split('-').join(' ');
	var keys = {albumTitle : title};
	async.waterfall([
		function(callback){
			dbTask.findOne('album', keys, null, callback);
		}
	], function(err, result, message){
		finalTask.renderSingle(err, res, result, message, 'album-single');
	});
});

module.exports = router;
