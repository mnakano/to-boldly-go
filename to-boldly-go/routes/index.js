var express = require('express');
var async = require('async');
var router = express.Router();
var dbOperations = require('../support-modules/dbOperations');
var finalTasks = require('../support-modules/finalTasks');

/* GET home page. */
router.get('/', function(req, res) {
	async.waterfall([
		function(callback){
			var options = {sort : {publishedDate : -1}, limit : 8};
			dbOperations.dbFindDocumentsTask(req.db.get('album'), null, options, callback);
		}
	], function(err, results, message){
		finalTasks.render(err, res, 'albums', results, message, 'index');
	});
});

/* GET a region page. */
router.get('/region/:region', function(req, res, next) {
	async.waterfall([
		function(callback){
			var keys = {region : req.params.region.split('-').join(' ')};
			dbOperations.dbFindDocumentsTask(req.db.get('album'), keys, null, callback);
		}
	], function(err, results, message){
		finalTasks.render(err, res, req.params.region, results, message, 'album-list')
	});
});

router.get('/category/:category', function(req, res, next) {
	async.waterfall([
		function(callback){
			var keys = {albumCategory : req.params.category.split('-').join(' ')};
			dbOperations.dbFindDocumentsTask(req.db.get('album'), keys, null, callback);
		}
	], function(err, results, message){
		finalTasks.render(err, res, req.params.category, results, message, 'album-list')
	});
});

router.get('/album-single/:title', function(req, res){
	var albums = req.db.get('album');
	var title = req.params.title.split('-').join(' ');
	albums.findOne({albumTitle:title}, function(err, doc){
		if(err){
			res.send("There was a problem finding the record: " + title);
		}else{
			res.render('album-single', {
				'album' : doc
			});
		}
	});
});

module.exports = router;
