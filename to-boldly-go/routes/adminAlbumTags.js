var express = require('express');
var async = require('async');
var router = express.Router();
var multiFormTask = require('../support-modules/multiFormTask');
var dbTask = require('../support-modules/dbTask');
var dbEntry = require('../support-modules/dbEntry');
var finalTask = require('../support-modules/finalTask');

var upload = multiFormTask.getUploadInstance('./public/images/tagPhotos/');

var isAuthenticated = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/');
}

router.get('/', //isAuthenticated, 
function(req, res) {
	res.render('album-tags-list', {title:'To Boldly Go'});
});

router.get('/newTag', //isAuthenticated, 
function(req, res){
	res.render('album-tags-new', {title:'To Boldly Go'})
});

router.post('/addAlbumTag', //isAuthenticated, 
upload.single('photo'), function(req, res){
	var newEntry;
	async.series([
		function(callback){
			if(req.body.tagType == 'countries'){
				var entry = {$push : {countries : req.body.name}};
				var id = {name : req.body.region};
				dbTask.dbUpdateTask(req.db.get('regions'), id, entry, callback);
			}else if(req.body.tagType == 'regions'){
				newEntry = dbEntry.createTagEntry(req, true);
				dbTask.dbInsertTask(req.db.get(req.body.tagType), newEntry, callback);
			}else{
				newEntry = dbEntry.createTagEntry(req, false);
				dbTask.dbInsertTask(req.db.get(req.body.tagType), newEntry, callback);
			}
		},
		function(callback){
			if(req.body.tagType == 'regions'){
				var newRegion = {name:req.body.name, countries:[]};
				req.app.locals.regions.push(newRegion);
			}else if(req.body.tagType == 'categories'){
				req.app.locals.categories.push(req.body.name);
			}else if(req.body.tagType == 'countries'){
				var regionIndex = -1;
				for(var i = 0; i < req.app.locals.regions.length; i++){
					if(req.app.locals.regions[i].name == req.body.region){
						regionIndex = i;
						break;
					}
				}
				req.app.locals.regions[regionIndex].countries.push(req.body.name);
			}
			callback();
		}
	], function(err){
		finalTask.redirect(err, res, '/adminAlbumTags');
	});
});

router.get('/deleteTag/:tagType/:tagName/:region?', //isAuthenticated, 
function(req, res){
	async.series([
		function(callback){
			if(req.params.tagType == 'regions'){
				var regionIndex = -1;
				for(var i = 0; i < req.app.locals.regions.length; i++){
					if(req.app.locals.regions[i].name == req.params.tagName.split('-').join(' ')){
						regionIndex = i;
						break;
					}
				}
				if(regionIndex > -1){
					req.app.locals.regions.splice(regionIndex, 1);
				}
			}else if(req.params.tagType == 'categories'){
				var index = req.app.locals.categories.indexOf(req.params.tagName.split('-').join(' '));
				if(index > -1){
					req.app.locals.categories.splice(index, 1);
				}
			}else if(req.params.tagType == 'countries'){
				var regionIndex = -1;
				for(var i = 0; i < req.app.locals.regions.length; i++){
					if(req.app.locals.regions[i].name == req.params.region.split('-').join(' ')){
						regionIndex = i;
						break;
					}
				}
				if(regionIndex > -1){
					var countryIndex = req.app.locals.regions[regionIndex].countries.indexOf(req.params.tagName.split('-').join(' '));
					if(countryIndex > -1){
						req.app.locals.regions[regionIndex].countries.splice(countryIndex, 1)
					}
				}			
			}
			callback();
		},
		function(callback){
			if(req.params.tagType == 'countries'){
				var entry = {$pull : {countries : req.params.tagName.split('-').join(' ')}};
				var id = {name : req.params.region.split('-').join(' ')};
				dbTask.dbUpdateTask(req.db.get('regions'), id, entry, callback);
			}else{
				var keys = {name : req.params.tagName.split('-').join(' ')};
				dbTask.dbDeleteTask(req.db.get(req.params.tagType), keys, callback);
			}	
		},
		function(callback){
			directoryHandler.deleteDirectoryTask('./public/images/tagPhotos/' + req.params.tagName + '.jpg', callback);
		}
	], function(err){
		finalTask.redirect(err, res, '/adminAlbumTags');
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
			dbTask.dbUpdateTask(req.db.get('album'), req.params.id, updatedEntry, callback);
		}
	], function(err){
		finalTask.redirect(err, res, '/region/' + updatedEntry.region.split(' ').join('-'));
	});
});*/

module.exports = router;