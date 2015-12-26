var express = require('express'),
	app = express(),
	helper = require('./helper'),
	sendFile = helper.sendFile;

//app.use(express.bodyParser());

//app.use(express.json());
//app.use(express.urlencoded());
//app.use(express.multipart());

//app.use(bodyParser.json()); // for parsing application/json
//app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


// use api - REST
app.post('/api/convert-photo', function(req, res){

	helper.saveFilesToDisk(req, res).then(function (data) {

		console.log(data);

	});


});

// send file
app.get('*', sendFile);

// Handle 404 - implemented by helper
/*
app.use(function(req, res) {
	res.send('404: Page not Found', 404);
});
*/

// Handle 500
app.use(function(error, req, res, next) {
	res.send('500: Internal Server Error', 500);
});

app.listen(process.env.PORT || 3000);