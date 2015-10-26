// top level variables
var mapPoints, map, tweetPoints = [];

function loadFilteredMapPoints(keyword){
	while(mapPoints.length>0){
		mapPoints.pop();
	}

	var points = tweetPoints;

	if (keyword !== "all") {
		points = tweetPoints.filter(function(tweet) {
			return tweet.category.indexOf(keyword) > -1
		})
	} 


	points.forEach(function(point) {
		var p = new google.maps.LatLng(point.coordinates[1], point.coordinates[0]);
		mapPoints.push(p);
	});
	
	$('#sidebar #counter').text("Total points:" + mapPoints.length);
	
}



function initMap() {

	mapPoints = new google.maps.MVCArray([]);

	map = new google.maps.Map(document.getElementById('map'), {
			zoom: 2,
			center: {lat: 0, lng: 0},
			mapTypeId: google.maps.MapTypeId.SATELLITE
	});

	heatmap = new google.maps.visualization.HeatmapLayer({
			opacity: 1,
			data: mapPoints,
			map: map
	});

	startListening();
}


function startListening() {
		var socket= io.connect();
		socket.on('tweets:connected', function(msg) {
			while (mapPoints.length > 0) {
				mapPoints.pop();
			}
		});

		socket.on('tweets:new', function(msg) {
			if (msg.coordinates !== undefined) {
				tweetPoints.push(msg);
				mapPoints.push(new google.maps.LatLng(msg.coordinates[1], msg.coordinates[0]));
				$('#sidebar #counter').text("Total points:" + mapPoints.length);
			}
		});
}


$(document).ready(function() {
	$('#dropdown').change(function(val) {
		loadFilteredMapPoints($('#dropdown').val())
	});
	
});

