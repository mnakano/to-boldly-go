var express = require('express');
var async = require('async');
var router = express.Router();
var dbTask = require('../support-modules/dbTask');
var finalTasks = require('../support-modules/finalTask');

/* GET home page. */
router.get('/', function(req, res) {
	async.waterfall([
		function(callback){
			var options = {sort : {publishedDate : -1}, limit : 8};
			dbTask.dbFindDocumentsTask(req.db.get('album'), null, options, callback);
		}
	], function(err, results, message){
		finalTasks.render(err, res, 'albums', results, message, 'index');
	});
});

router.get('/region/:region', function(req, res, next) {
	async.waterfall([
		function(callback){
			var keys = {region : req.params.region.split('-').join(' ')};
			var options = {sort : {albumDate : -1}};
			dbTask.dbFindDocumentsTask(req.db.get('album'), keys, options, callback);
		}
	], function(err, results, message){
		finalTasks.render(err, res, req.params.region, results, message, 'album-list')
	});
});

router.get('/category/:category', function(req, res, next) {
	async.waterfall([
		function(callback){
			var keys = {albumCategory : req.params.category.split('-').join(' ')};
			var options = {sort : {albumDate : -1}};
			dbTask.dbFindDocumentsTask(req.db.get('album'), keys, options, callback);
		}
	], function(err, results, message){
		finalTasks.render(err, res, req.params.category, results, message, 'album-list')
	});
});

router.get('/country/:country', function(req, res, next) {
	async.waterfall([
		function(callback){
			var keys = {country : req.params.country.split('-').join(' ')};
			var options = {sort : {albumDate : -1}};
			dbTask.dbFindDocumentsTask(req.db.get('album'), keys, options, callback);
		}
	], function(err, results, message){
		finalTasks.render(err, res, req.params.country, results, message, 'album-list')
	});
});

router.get('/search', function(req, res, next){
	var search = req.query['search'];
	async.waterfall([
		function(callback){
			var keys = {$text:{$search:search}};
			var options = {sort : {publishedDate : -1}};
			dbTask.dbFindDocumentsTask(req.db.get('album'), keys, options, callback);
		}
	], function(err, results, message){
		finalTasks.render(err, res, search, results, message, 'album-list', true)
	});
});

router.get('/album-single/:title', function(req, res){
	var albums = req.db.get('album');
	var title = req.params.title.split('-').join(' ');
	albums.findOne({albumTitle:title}, function(err, doc){
		if(err){
			console.log(err);
			res.send("There was a problem finding the record: " + title);
		}else{
			console.log("SUCCESS!!!");
			res.render('album-single', {
				'album' : doc
			});
		}
	});
});

module.exports = router;
