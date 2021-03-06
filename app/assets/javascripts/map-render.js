if ($("#map")) {
  $(document).ready(function() {
    var map = new Map({
      overpassPrefix: "https://overpass-api.de/api/interpreter?data=",
      mapboxPk: "pk.eyJ1Ijoic2FsbHlhbW9vcmUiLCJhIjoiY2lmZm53MmlkOHA2YnNka25wd3BmNDB3dyJ9.F5FdTfUY5XLbzWMcWpRp2A",
      baseMap: 'sallyamoore.nkikgok3',
      startLatLon: [52.2884, 4.7446],
      minZoom: 9,
      maxZoom: 18,
      startZoom: 13,
      bikeMapLayer: 'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png',
      iconClassName: 'css-icon',
      iconSize: [ 50, 50 ],
      attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>'
    });

    var trashToCollect = '.alert';
    var alertContent = {
      badQuery:  {
        class: 'alert-danger',
        text: 'No matching locations! Check your query and try again.'
      },
      zoomAlert: {
        class: 'zoom-alert alert-warning',
        text: 'Zoom in to view clickable nodes.'
      },
      nodeSaved: {
        class: 'alert-success node-saved',
        text: "Success! Location saved to your account."
      }
    };

    map.loadMap( function(result) {
      // Show location search input
      $(".find-location").click(function(event) {
        event.preventDefault();
        collectTrash(trashToCollect);
        toggleSearchForm();
      });

      // Search for entered location
      $(".location-submit").click(function(event) {
        event.preventDefault();
        collectTrash(trashToCollect);
        collectLocationTrash();

        var locationQuery = $("input.location-query").val();
        var geocoder = L.mapbox.geocoder('mapbox.places');

        // API query -- leaflet geocoder
        geocoder.query(locationQuery, showMap);
      });

      // show queried location on map
      function showMap(err, data) {
        queryMarker = L.Marker.extend({
          options: {
            type: ''
          }
        });

        $('.directions-icon #directions').hide('fast');

        var featuresFound = data.results.features.length === 0 ? false :true;
        if (featuresFound) {
          map.osm_map.setView(data.latlng, 13);

          marker = new queryMarker(data.latlng, {
            zIndexOffset: 1000,
            alt: "Queried location",
            type: "locationSearch"
          });
          map.osm_map.addLayer(marker);
          marker.bindPopup(data.results.features[0].place_name);
          toggleSearchForm();

        } else {
          showAlert(alertContent.badQuery);
        }
      }

      // Find user's current location
      $(".my-location").click(function(event) {
        event.preventDefault();
        collectTrash(trashToCollect);
        $('.directions-icon').hide('fast');
        if (typeof(marker) !== 'undefined') { map.osm_map.removeLayer(marker); }

        result.locate( { setView: true, maxZoom: map.startZoom } );
      });
      // Listeners: When location found/error, execute function in my-location.js
      result.on('locationfound', onLocationFound);
      result.on('locationerror', onLocationError);

      // Populate markers on zoom or move.
      result.on('zoomend, moveend', function(event) {
        collectTrash(trashToCollect);
        var zoom = result.getZoom();
        if (zoom > 11) {
          map.findBounds(map.osm_map);
        } else {
          setTimeout(function() {
            $('.css-icon').remove();
            showAlert(alertContent.zoomAlert);
          }, 250);
        }
      });
    });

    // Route to clicked bike node or searched location.
    $(document).on( "click", ".css-icon", function(event) {
      collectTrash(trashToCollect);
      var nodeData = $( this ).data(),
        directions = L.mapbox.directions({
          profile: 'mapbox.cycling'
        }),
        routeFormat = {
          routeStyle: {
            color: '#F60131',
            weight: 7,
            opacity: 0.75,
            className: "route"
          }
        },
        originLatLng = null;

      if ($(".user-location").data()) {
        originLatLng = L.latLng(
          $(".user-location").data().lat, $(".user-location").data().lng
        );
        createRoute();
        map.osm_map.locate( { setView: false, watch: true, maximumAge: 5000, maxZoom: 16 } );
      } else if (typeof(marker) !== 'undefined') {
        map.osm_map.stopLocate();
        originLatLng = marker.getLatLng();
        createRoute();
      }

      function createRoute() {
        // map.osm_map.locate( { setView: false, watch: true, maximumAge: 5000, maxZoom: 16 } );

        // Origin is current location OR searched location
        directions.setOrigin(originLatLng);
        // Destination is clicked node
        directions.setDestination(L.latLng(nodeData.latitude, nodeData.longitude));

        directions.query();
        var directionsLayer = L.mapbox.directions.layer(directions, routeFormat)
          .addTo(map.osm_map);
        var directionsRoutesControl = L.mapbox.directions.routesControl('routes', directions)
          .addTo(map.osm_map);
        var directionsInstructionsControl = L.mapbox.directions.instructionsControl('instructions', directions)
          .addTo(map.osm_map);

        // Remove layers if another bike node (.css-icon) is clicked
        $(document).on( "click", ".css-icon, .my-location, .find-location", function() {
          map.osm_map.removeLayer(directionsLayer);
          map.osm_map.removeLayer(directionsRoutesControl);
        });

        showDirectionsIcon();
      }
    });
  });
}

function showDirectionsIcon() {
  $('.directions-icon').show('fast');
}

function toggleSearchForm() {
  $(".location-search").slideToggle();
}

function collectTrash(trashToCollect) {
  $(trashToCollect).remove();
}

function collectLocationTrash() {
  $(".user-location").parent().remove();
  $("img.leaflet-marker-icon").remove();
  $("img.leaflet-marker-shadow").remove();
}

function showAlert(whichAlert) {
  var alert = document.createElement('div');
  alert.className = 'alert ' + whichAlert.class;
  document.getElementsByClassName('alerts-div')[0].appendChild(alert);
  $(alert).text(whichAlert.text);
  setTimeout(function() {
    $('.alert').fadeOut('fast');
  }, 3000);
}
