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

router.get('/filter/:filterType/:keyword?', function(req, res, next){
	var keyword;
	var keys;
	var options;
	var search = false;
	async.waterfall([
		function(callback){
			switch(req.params.filterType){
				case "region":
					keys = {region : req.params.keyword.split('-').join(' ')};
					options = {sort : {albumDate : -1}};
					keyword = req.params.keyword;
					break;
				case "country":
					keys = {country : req.params.keyword.split('-').join(' ')};
					options = {sort : {albumDate : -1}};
					keyword = req.params.keyword;
					break;
				case "category":
					keys = {albumCategory : req.params.keyword.split('-').join(' ')};
					options = {sort : {albumDate : -1}};
					keyword = req.params.keyword;
					break;
				case "search":
					keys = {$text:{$search:req.query['search']}};
					options = {sort : {publishedDate : -1}};
					search = true;
					keyword = req.query['search'];
					break;
			}
			callback();
		},
		function(callback){
			dbTask.findMany('album', keys, options, callback);
		}
	], function(err, results, message){
		finalTask.render(err, res, keyword, results, message, 'album-list', search)
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
