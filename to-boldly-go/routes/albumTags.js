var express = require('express');
var async = require('async');
var router = express.Router();
var directoryHandler = require('./directoryHandler');
var multiFormHandler = require('./multiFormHandler');
var dbOperations = require('./dbOperations');
var dbEntry = require('./dbEntry');
var finalTasks = require('./finalTasks');

var upload = multiFormHandler.getUploadInstance('./public/images/tagPhotos/');

router.get('/', function(req, res) {
	res.render('album-tags-list', {title:'To Boldly Go'});
});

router.get('/newTag', function(req, res){
	res.render('album-tags-new', {title:'To Boldly Go'})
});

router.post('/addAlbumTag', upload.single('photo'), function(req, res){
	var newEntry = dbEntry.createTagEntry(req);
	async.series([
		function(callback){
			dbOperations.dbInsertTask(req.db.get(req.body.tagType), newEntry, callback);
		},
		function(callback){
			console.log('start populating the app.locals');
			if(req.body.tagType == 'regions'){
				req.app.locals.regions.push(req.body.name);
			}else if(req.body.tagType == 'categories'){
				req.app.locals.categories.push(req.body.name);
			}else if(req.body.tagType == 'countries'){
				req.app.locals.countries.push(req.body.name);
			}
			console.log('finished populating the app.locals');
			callback();
		}
	], function(err){
		finalTasks.redirect(err, res, '/albumTags');
	});
});

module.exports = router;