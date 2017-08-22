module.exports = {
	createDBEntry: function(req){
		var entry = {};
		
		//set request field values
		var albumTitle = req.body.albumTitle;
		var region = req.body.region;
		var photoArray = [];
		
		//set folder names
		var regionFolder = region.split(' ').join('-');
		var albumFolder = albumTitle.split(' ').join('-');
		
		//build photo directory
		var photoDirectory = "/images/" + regionFolder + "/" + albumFolder + "/";
		var descriptions = req.body.photoDescription;
		
		//set photo location and description
		if(req.files.length > 1){	
			for(var i = 0; i < req.files.length; i++){
				photoArray.push({"photo" : photoDirectory + req.files[i].originalname, "photoDescription" : descriptions[i]});
			}
		}else{
			photoArray.push({"photo" : photoDirectory + req.files[0].originalname, "photoDescription" : descriptions});
		}
		
		var entry = {
			"albumTitle" : albumTitle,
			"albumCategory" : req.body.albumCategory,
			"country" : req.body.country,
			"region" : region,
			"albumDate" : req.body.albumDate,
			"journal" : req.body.journal,
			"photos" : photoArray,
			"publishedDate" : new Date().toISOString(),
			"photoDirectory" : photoDirectory
		};
		
		return entry;
	},
	
	createTagEntry: function(req){
		var entry = {
			"name" : req.body.name
		};
		
		return entry;
	}
}