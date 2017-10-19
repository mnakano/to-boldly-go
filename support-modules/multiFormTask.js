var multer = require('multer');

module.exports = {
	getUploadInstance: function(destinationPath){
		//configure multer upload object
		var storage = multer.diskStorage({
			destination: function(req, file, cd){
				cd(null, destinationPath);
			},
			filename: function(req, file, cd){
				cd(null, file.originalname);
			}
		});

		return multer({storage : storage});
	}
}