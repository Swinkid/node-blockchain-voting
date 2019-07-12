const SetupRoute = (app, blockchain) => {

	app.get('/setup/master', function(req, res, next) {
		res.render('setup/master');
	});

	app.get('/setup/client', function (req, res, next) {
		res.render('setup/client');
	});

	app.post('/setup/master', function(req, res, next){
		//TODO Handle master setup
	});

	app.post('/setup/client', function (req, res, next) {
		//TODO: Handle key upload
	});

	app.get('/setup', function (req, res, next) {
		//TODO: If keys already exist, skip?
	})
};



module.exports = SetupRoute;
