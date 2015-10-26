var express = require('express');
var mongo = require('mongodb').MongoClient;
var bodyParser = require('body-parser');

var mongoURI;

if (process.env.NODE_ENV == "dev") {
	mongoURI = "mongodb://127.0.0.1/twitterDatabase_test";
} else {
	mongoURI = "mongodb://172.31.57.60/twitterDatabase_test";
}

console.log(mongoURI);


var app = express();;

var http = require('http').Server(app);
var io = require('socket.io')(http);

// setup static content
app.use(express.static(__dirname + "/public"));

// parse application/json
app.use(bodyParser.json());

function startListening(socket)  {
    mongo.connect(mongoURI, function(err, db) {
        var collection = db.collection('tweetsCollection_test');
        collection
            .find({}, { tailable:true, awaitdata:true })
            .each(function(err, doc) { 
                if (doc !== undefined) {
                    console.log("Sending new tweet to client", doc);
                    socket.emit("tweets:new", {coordinates: doc.coordinates, category: doc.category});
                }
            })
    });
}

io.on('connection', function(socket) {
    console.log("new user connected");
    socket.emit("tweets:connected", { msg: "hello world from server" });
    startListening(socket);
});

var port = 3000;
// start listening
http.listen(process.env.PORT || port, function() {
    console.log('listening on 3000');
});
