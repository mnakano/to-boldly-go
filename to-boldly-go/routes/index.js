var express = require('express');
var router = express.Router();

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

router.get('/deleteAlbum/:id', function(req, res){
	var album = req.db.get('album');
	album.remove({_id:req.params.id}, 
		function(err, doc){
			if(err){
				res.send("There was an error deleting a record from the database.");
			}else{
				res.redirect("/south-america");
			}
	});
});

/*POST to Add Album Service*/
router.post('/addAlbum', function(req, res){
	var db = req.db;
	
	var albumTitle = req.body.albumTitle;
	var continent = req.body.continent;
	
	//get continent folder name
	var continentFolder = continent.toLowerCase().split(' ').join('-');
	//get album folder name
	var albumFolder = albumTitle.toLowerCase().split(' ').join('-');
	//get photo URL
	var photoURL = "/images" + "/" + continentFolder + "/" + albumFolder + "/";
	
	//handle the photo array
	var photos = req.body.photo;
	var descriptions = req.body.photoDescription;
	var photoArray = [];
	if(photos.constructor === Array){	
		for(var i = 0; i < photos.length; i++){
			photoArray.push({"photo" : photoURL + photos[i], "photoDescription" : descriptions[i]});
		}
	}else{
		photoArray.push({"photo" : photoURL + photos, "photoDescription" : descriptions});
	}

	var newEntry = {
		"albumTitle" : albumTitle,
		"albumCategory" : req.body.albumCategory,
		"country" : req.body.country,
		"continent" : continent,
		"albumDate" : req.body.albumDate,
		"photos" : photoArray,
		"publishedDate" : new Date().toISOString()
	};
	
	//set collection
	var collection = db.get('album');
	
	//submit to the database
	collection.insert(newEntry, function(err, doc){ //error handling
		if(err){
			res.send("There was a problem adding the record to the database.");
		} else {
			res.redirect("south-america");
		}
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
	//get photo URL
	var photoURL = "/images" + "/" + continentFolder + "/" + albumFolder + "/";
	
	//handle the photo array
	var photos = req.body.photo;
	var descriptions = req.body.photoDescription;
	var photoArray = [];
	if(photos.constructor === Array){	
		for(var i = 0; i < photos.length; i++){
			photoArray.push({"photo" : photoURL + photos[i], "photoDescription" : descriptions[i]});
		}
	}else{
		photoArray.push({"photo" : photoURL + photos, "photoDescription" : descriptions});
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
