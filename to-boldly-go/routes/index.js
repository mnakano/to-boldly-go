var express = require('express');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var multer = require('multer');
var fs = require('fs');
var router = express.Router();

//configure multer upload object
var storage = multer.diskStorage({
	destination: function(req, file, cd){
		cd(null, './public/images/tmp/');
	},
	filename: function(req, file, cd){
		cd(null, file.originalname);
	}
});

var upload = multer({storage : storage}).array('photo');

/* GET home page. */
router.get('/', function(req, res, net) {
	res.render('index', { title : 'To Boldly Go' });
});

/* GET a continent page. */
router.get('/south-america', function(req, res, next) {
  var db = req.db;
  var albums = db.get('album');
  albums.find({}, {}, function(e, docs){
	res.render('album-list', {
			title:'To boldy Go', 
			'albums' : docs
		});
  });
});

/*GET new album entry page*/
router.get('/new-album', function(req, res){
	res.render('new-album', {title : 'To Boldly Go'});
});

router.get('/deleteAlbum/:id/:continent/:title', function(req, res){
	var album = req.db.get('album');
	
	//gets an album directory to be deleted.
	var directory = './public/images/' + req.params.continent + '/' + req.params.title;
	
	album.remove({_id:req.params.id}, 
		function(err, doc){
			if(err){
				res.send("There was an error deleting a record from the database.");
			}else{
				//deletes the album directory. (CHECK if this is a good place to do it.)
				rimraf(directory, function(err){
					if(err){
						console.log('There was an error deleting ' + directory);
					}else{
						console.log(directory + ' has been successfully deleted.');
					}
				});
				res.redirect("/south-america");
			}
	});
});

/*POST to Add Album Service*/
router.post('/addAlbum', function(req, res){
	//upload the photos then perform directory manipulation and DB operation.
	upload(req, res, function(err){
		if(err){
			console.log('There was an error uploading a photo.');
		}
		
		//set request field values
		var albumTitle = req.body.albumTitle;
		var albumCategory = req.body.albumCategory;
		var continent = req.body.continent;
		var country = req.body.country;
		var albumDate = req.body.albumDate;
		var photoArray = [];
		
		//get continent folder name
		var continentFolder = continent.toLowerCase().split(' ').join('-');
		
		//get album folder name
		var albumFolder = albumTitle.toLowerCase().split(' ').join('-');
		
		//build album directory
		var photoDirectory = "/images/" + continentFolder + "/" + albumFolder + "/";
		var descriptions = req.body.photoDescription;
				
		mkdirp('./public' + photoDirectory, function(err){
			if(err){
				console.error(err);
			}else{
				console.log(photoDirectory + ' exists or has been created.');
			}
		});
		
		//set photo location and description
		if(req.files.length > 1){	
			for(var i = 0; i < req.files.length; i++){
				photoArray.push({"photo" : photoDirectory + req.files[i].originalname, "photoDescription" : descriptions[i]});
			}
		}else{
			photoArray.push({"photo" : photoDirectory + req.files[0].originalname, "photoDescription" : descriptions});
		}
		
		//move the photos from 'tmp' directory to album directory
		var oldPath = req.files[0].destination + '/';
		var newPath = './public' + photoDirectory;
		for(var i = 0; i < req.files.length; i++){
			fs.rename(oldPath + req.files[i].originalname, newPath + req.files[i].originalname, function(err){
				if(err){
					console.log('Error attempting to move a photo. ' + err);
				}else{
					console.log('File has been moved.');
				}
			});
		}
		
		var newEntry = {
			"albumTitle" : albumTitle,
			"albumCategory" : albumCategory,
			"country" : country,
			"continent" : continent,
			"albumDate" : albumDate,
			"photos" : photoArray,
			"publishedDate" : new Date().toISOString()
		};
	
		//set collection
		var collection = req.db.get('album');
	
		//submit to the database
		collection.insert(newEntry, function(err, doc){ //error handling
			if(err){
				res.send("There was a problem adding the record to the database.");
			} else {
				res.redirect("south-america");
			}
		});
	});
});

/*GET an album data to edit form*/
router.get('/edit-form/:id', function(req, res){
	var db = req.db;
	var albums = db.get('album');
	albums.findOne({_id:req.params.id}, function(err, doc){
		if(err){
			res.send("There was a problem finding the record.");
		}else{
			console.log(doc._id);
			res.render('edit-form', {
				title:'To boldy Go', 
				'album' : doc
			});
		}
	});
});

/*UPDATE an album data*/
router.post('/editAlbum/:id', function(req, res){
	var db = req.db;
	
	//get the field values
	var albumTitle = req.body.albumTitle;
	var continent = req.body.continent;
	
	//get continent folder name
	var continentFolder = continent.toLowerCase().split(' ').join('-');
	//get album folder name
	var albumFolder = albumTitle.toLowerCase().split(' ').join('-');
	//build photo directory
	var photoDirectory = "/images/" + continentFolder + "/" + albumFolder + "/";
	
	//create the directory if it does not exist
	mkdirp('./public' + photoDirectory, function(err){
		if(err){
			console.error(err);
		}else{
			console.log(photoDirectory + ' exists or has been created.');
		}
	});
	
	//handle the photo array
	var photos = req.body.photo;
	var descriptions = req.body.photoDescription;
	var photoArray = [];
	if(photos.constructor === Array){	
		for(var i = 0; i < photos.length; i++){
			photoArray.push({"photo" : photoDirectory + photos[i], "photoDescription" : descriptions[i]});
		}
	}else{
		photoArray.push({"photo" : photoDirectory + photos, "photoDescription" : descriptions});
	}
	
	var updatedEntry = {
		"albumTitle" : albumTitle,
		"albumCategory" : req.body.albumCategory,
		"country" : req.body.country,
		"continent" : continent,
		"albumDate" : req.body.albumDate,
		"photos" : photoArray,
		"publishedDate" : new Date().toISOString()
	};
	
	var collection = db.get('album');
	
	collection.update({_id:req.params.id}, {$set:updatedEntry}, function(err, doc){
			if(err){
				res.send("There was a problem updating a record.");
			}else{
				res.redirect('/south-america');
			}
	});
});

module.exports = router;
