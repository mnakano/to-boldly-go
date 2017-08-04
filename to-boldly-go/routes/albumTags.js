var express = require('express');
var async = require('async');
var router = express.Router();
var directoryHandler = require('../support-modules/directoryHandler');
var multiFormHandler = require('../support-modules/multiFormHandler');
var dbOperations = require('../support-modules/dbOperations');
var dbEntry = require('../support-modules/dbEntry');
var finalTasks = require('../support-modules/finalTasks');

var upload = multiFormHandler.getUploadInstance('./public/images/tagPhotos/');

var isAuthenticated = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/');
}

router.get('/', isAuthenticated, function(req, res) {
	res.render('album-tags-list', {title:'To Boldly Go'});
});

router.get('/newTag', isAuthenticated, function(req, res){
	res.render('album-tags-new', {title:'To Boldly Go'})
});

router.post('/addAlbumTag', isAuthenticated, upload.single('photo'), function(req, res){
	var newEntry = dbEntry.createTagEntry(req);
	async.series([
		function(callback){
			if(req.body.tagType == 'regions'){
				directoryHandler.createDirectoryTask('./public/images/' + newEntry.name.split(' ').join('-'), callback);
			}else{
				callback();
			}
		},
		function(callback){
			dbOperations.dbInsertTask(req.db.get(req.body.tagType), newEntry, callback);
		},
		function(callback){
			if(req.body.tagType == 'regions'){
				req.app.locals.regions.push(req.body.name);
			}else if(req.body.tagType == 'categories'){
				req.app.locals.categories.push(req.body.name);
			}else if(req.body.tagType == 'countries'){
				req.app.locals.countries.push(req.body.name);
			}
			callback();
		}
	], function(err){
		finalTasks.redirect(err, res, '/albumTags');
	});
});

router.get('/deleteTag/:tagType/:tagName', isAuthenticated, function(req, res){
	async.series([
		function(callback){
			if(req.params.tagType == 'regions'){
				var index = req.app.locals.regions.indexOf(req.params.tagName.split('-').join(' '));
				if(index > -1){
					req.app.locals.regions.splice(index, 1);
				}
			}else if(req.params.tagType == 'categories'){
				var index = req.app.locals.categories.indexOf(req.params.tagName.split('-').join(' '));
				if(index > -1){
					req.app.locals.categories.splice(index, 1);
				}
			}else if(req.params.tagType == 'countries'){
				var index = req.app.locals.countries.indexOf(req.params.tagName.split('-').join(' '));
				if(index > -1){
					req.app.locals.countries.splice(index, 1);
				}
			}
			callback();
		},
		function(callback){
			var keys = {name : req.params.tagName.split('-').join(' ')};
			dbOperations.dbDeleteTask(req.db.get(req.params.tagType), keys, callback);
		},
		function(callback){
			directoryHandler.deleteDirectoryTask('./public/images/tagPhotos/' + req.params.tagName + '.jpg', callback);
		},
		function(callback){
			if(req.params.tagType == 'regions'){
				directoryHandler.deleteDirectoryTask('./public/images/' + req.params.tagName, callback);
			}else{
				callback();
			}
		}
	], function(err){
		finalTasks.redirect(err, res, '/albumTags');
	});
});

// EDIT function for future improvements
/*router.get('/editTagForm/:tagType/:tagName', function(req, res){
	var collection = req.db.get(req.params.tagType);
	var tagName = req.params.tagName.split('-').join(' ');
	collection.findOne({name:tagName}, function(err, doc){
		if(err){
			res.send("There was a problem finding the record.");
		}else{
			res.render('album-tags-edit', {
				'tag' : doc
			});
		}
	});
});

router.post('/editAlbumTag/:tagName', upload.array('photo'), function(req, res){
	var updatedEntry = dbEntry.createTagEntry(req);
	async.series([
		function(callback){
			if(req.body.tagType == 'regions'){
				directoryHandler.createDirectoryTask('./public/images/' + newEntry.name.split(' ').join('-'), callback);
			}else{
				callback();
			}
		},
		function(callback){
			directoryHandler.deletePhotosTask('./public' + updatedEntry.photoDirectory, callback);
		},
		function(callback){
			directoryHandler.movePhotosTask(req.files[0].destination + '/', './public' + updatedEntry.photoDirectory, req.files, callback);
		},
		function(callback){
			dbOperations.dbUpdateTask(req.db.get('album'), req.params.id, updatedEntry, callback);
		}
	], function(err){
		finalTasks.redirect(err, res, '/region/' + updatedEntry.region.split(' ').join('-'));
	});
});*/

module.exports = router;