//define url variables for earthquake data API calls
var url1 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var url2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

//define map layers for map data API calls
var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: api_key
});

var darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/dark-v10",
    accessToken: api_key
});

var satMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution:  "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-v9",
    accessToken: api_key
});

//define starting point for map display
var map = L.map("map", {
    center: [38.58, -121.49],
    zoom: 5,
    layers: [lightMap, darkMap, satMap]
});

//add 'lightMap' tile layer
lightMap.addTo(map);

//add earthquake data layers
var quakeMap = new L.LayerGroup();
var tectMap = new L.LayerGroup();

//define map object
var baseMaps = {
    Satellite: satMap,
    Dark: darkMap,
    Light: lightMap
};

//define overlay object
var olMaps = {
    Quakes: quakeMap,
    Faults: tectMap
};

//add layer control
L.control.layers(baseMaps, olMaps).addTo(map);

//retrieve earthquake geoJSON data
d3.json(url1, function(data) {
    //define function to stylize earthquake data onto map
    function getStyle(feature) {
        return {
            radius: getSize(feature.properties.mag),
            fillColor: getColors(feature.properties.mag),
            color: "#000000",
            weight: 0.5,
            opacity: 1,
            fillOpacity: 1,
            stroke: true
        };
    }
    //define function to assign colors to earthquake markers based on magnitude
    function getColors(magnitude) {
        switch(true) {
            case magnitude > 5:
                return "#E76F51";
            case magnitude > 4:
                return "#F4A261";
            case magnitude > 3:
                return "#E9C46A";
            case magnitude > 2:
                return "#2A9D8F";
            case magnitude > 1:
                return "#264653";
            default:
                return "#03448B";
        }
    }
    //define function to determine radius of markers based on magnitude
    function getSize(magnitude) {
        if (magnitude === 0) {
          return 1;
        }
    
        return magnitude * 4;
    }

    //add geoJSON layer to map
    L.geoJson(data, {
        //convert features to circle markers
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng); 
        },
        //stylize circlemarkers
        style: getStyle,
        //create popup tooltip with location and magnitude data
        onEachFeature: function(feature, layer) {
            layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place)
        }
    //add data to quake layer
    }).addTo(quakeMap);

    //add quake layer to map
    quakeMap.addTo(map)

    //create legend
    var legend = L.control({
        position: "bottomright"
    });

    //add legend data
    legend.onAdd = function() {
        var div = L
            .DomUtil
            .create("div", "info legend");
        
        var grades = [0, 1, 2, 3, 4, 5];
        var colors = [
            "#03448B",
            "#264653",
            "#2a9d8f",
            "#e9c46a",
            "#f4a261",
            "#e76f51"
        ];

        for (var i = 0; i < grades.length; i++) {
            div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
                grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }
        return div;
    };

    legend.addTo(map);

    //add tectonic plate layer data
    d3.json(url2, function(data) {
        L.geoJson(data, {
            color: "navy",
            weight: 2
        })
        .addTo(tectMap);

        //add plate layer to map
        tectMap.addTo(map);
    });

});
