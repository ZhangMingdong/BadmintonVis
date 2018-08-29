
module.exports = function(app) {
    // new version
    app.get('/test_single', function (req, res) {
        res.sendfile('./public/main2.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
    app.get('/test', function (req, res) {
        res.sendfile('./public/main3.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
	// application -------------------------------------------------------------
	app.get('*', function (req, res) {
	    console.log("-----get* from "+req.host+" at "+Date());

		//res.sendfile('./public/mainFencing.html'); // load the single view file (angular will handle the page changes on the front-end)
        res.sendfile('./public/main.html');
	});



};



























