var url1 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var url2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: api_key
});

// var darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
//     attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
//     tileSize: 512,
//     maxZoom: 18,
//     id: "dark-v10",
//     accessToken: api_key
// });

// var satMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
//     attribution:  "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
//     tileSize: 512,
//     maxZoom: 18,
//     id: "satellite-v9",
//     accessToken: api_key
// });

var map = L.map("map", {
    center: [38.58, 121.49],
    zoom: 3,
    layers: [lightMap]
});


lightMap.addTo(map);

var quakeMap = new L.LayerGroup();

var tectMap = new L.LayerGroup();

var baseMaps = {
    Light: lightMap,
    // Dark: darkMap,
    // Satellite: satMap
};

var olMaps = {
    Quakes: quakeMap,
    Faults: tectMap
};

L.control.layers(baseMaps, olMaps).addTo(map);


d3.json(url1, function(data) {

    function getStyle(feature) {
        return {
            radius: feature.properties.mag * 4,
            fillColor: getColors(feature.properties.mag),
            color: "#000000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
    }
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
        }
    }
    function getSize(magnitude) {
        if (magnitude === 0) {
          return 1;
        }
    
        return magnitude * 4;
    }

    L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng); 
        },

        style: getStyle,
        onEachFeature: function(feature, layer) {
            layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place)
        }
    }).addTo(quakeMap);

    quakeMap.addTo(map)

    var legend = L.control({
        position: "bottomright"
    });

    legend.onAdd = function() {
        var div = L
            .DomUtil
            .create("div", "info legend");
        var grades = [0, 1, 2, 3, 4, 5];
        var colors = [
            "#264653",
            "#2a9d8f",
            "#e9c46a",
            "#f4a261",
            "#e76f51"
        ];

        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                "<i style='background: " + colors[i] + "'></i> " +
                grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }
        return div;
    };

    legend.addTo(map);

    d3.json(url2, function(tectMap) {
        L.geoJson(tectMap, {
            color: "green",
            weight: 2
        })
        .addTo(tectMap);

        tectMap.addTo(map);
    });

});
