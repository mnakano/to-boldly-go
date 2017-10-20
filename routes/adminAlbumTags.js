var express = require('express');
var async = require('async');
var router = express.Router();
var s3Task = require('../support-modules/s3Task');
var dbTask = require('../support-modules/dbTask');
var dbEntry = require('../support-modules/dbEntry');
var finalTask = require('../support-modules/finalTask');

var upload = s3Task.getUploadInstance('tagPhotos/');

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
	var newEntry;
	async.series([
		function(callback){
			if(req.body.tagType == 'countries'){
				var entry = {$push : {countries : req.body.name}};
				var id = {name : req.body.region};
				dbTask.update('regions', id, entry, callback);
			}else if(req.body.tagType == 'regions'){
				newEntry = dbEntry.createTagEntry(req, true);
				dbTask.insert(req.body.tagType, newEntry, callback);
			}else{
				newEntry = dbEntry.createTagEntry(req, false);
				dbTask.insert(req.body.tagType, newEntry, callback);
			}
		},
		function(callback){
			if(req.body.tagType == 'regions'){
				var newRegion = {name:req.body.name, countries:[]};
				req.app.locals.regions.push(newRegion);
			}else if(req.body.tagType == 'categories'){
				var newCategory = {name:req.body.name};
				req.app.locals.categories.push(newCategory);
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

router.get('/deleteTag/:tagType/:tagName/:region?', isAuthenticated, function(req, res){
	async.series([
		function(callback){
			if(req.params.tagType == 'regions'){
				findAndSplice(req.app.locals.regions, req.params.tagName.split('-').join(' '));
			}else if(req.params.tagType == 'categories'){
				findAndSplice(req.app.locals.categories, req.params.tagName.split('-').join(' '));
			}else if(req.params.tagType == 'countries'){
				findAndSplice(req.app.locals.regions, req.params.region.split('-').join(' '), true, req.params.tagName.split('-').join(' '));
			}
			callback();
		},
		function(callback){
			if(req.params.tagType == 'countries'){
				var entry = {$pull : {countries : req.params.tagName.split('-').join(' ')}};
				var id = {name : req.params.region.split('-').join(' ')};
				dbTask.update('regions', id, entry, callback);
			}else{
				var keys = {name : req.params.tagName.split('-').join(' ')};
				dbTask.deleteDoc(req.params.tagType, keys, callback);
			}	
		},
		function(callback){
			s3Task.deletePhoto('tagPhotos/' + req.params.tagName + '.jpg', callback);
		}
	], function(err){
		finalTask.redirect(err, res, '/adminAlbumTags');
	});
});

function findAndSplice(tagArray, tagName, country = false, countryName = null){
	var index = -1;
	for(var i = 0; i < tagArray.length; i++){
		if(tagArray[i].name == tagName){
			index = i;
			break;
		}
	}
	if(index > -1){
		if(country){
			var countryIndex = tagArray[index].countries.indexOf(countryName);
			if(countryIndex > -1){
				tagArray[index].countries.splice(countryIndex, 1)
			}
		}else{
			tagArray.splice(index, 1);
		}
	}
}

module.exports = router;