var map;
var markers = [];
var allFilms = [];

var SFAPI = "http://data.sfgov.org/resource/yitu-d5am.json";
var GOOGLEGEOAPI = "http://maps.googleapis.com/maps/api/geocode/json";

/**
initialize the map and search field.
also load all movies filmed in SF (for autocomplete)
*/
function initialize()
{
   var mapProp = {
     center:new google.maps.LatLng(37.7378698,-122.4321153),
     zoom:12,
     mapTypeId:google.maps.MapTypeId.ROADMAP
     };
   map=new google.maps.Map(document.getElementById("googleMap")
     ,mapProp);
     
   $.ajax({
      url: SFAPI+"?$select=title&$group=title",
      type: "get",
      success: function(response) {
         $.each(response, function(i, item){
            allFilms.push(item.title);
         });
         //console.log(allFilms);
         $('#searchInput').autocomplete({
            source:allFilms,
            select: function( event, ui ) {
               findLocationsForFilm(ui.item.value);
            }
         });
      }
   });
}

/**
remove all markers from the map
*/
function clearMarkers() {
  for (var i = 0; i < markers.length; i++ ) {
    markers[i].setMap(null);
  }
  markers.length = 0;
}

/**
for a given location name, find its coordinates
   poi - name of location
*/
function lookupPOI(poi)
{
   params = {address: poi+', sf', sensor:"false"};
   $.ajax({
      url: GOOGLEGEOAPI,
      type: "get",
      data: params,
      success: function(response) {
         if (response && response.results[0]) {
            addPOI(response.results[0],poi);
         }
      }
   });
}

/**
Add marker to map
   obj - location object from SF data API
   poi_str - name of the location
*/
function addPOI(obj,poi_str)
{
   center = new google.maps.LatLng(obj.geometry.location.lat,obj.geometry.location.lng);
   marker = new google.maps.Marker({
      position:center, 
      map:map, 
      title:poi_str,
      icon: 'http://labs.google.com/ridefinder/images/mm_20_red.png'
   });
   markers.push(marker);
}

/**
recenter map
*/
function recenterMap()
{
   var x = 0;
   var y = 0;
   var totCount = 0;
   $.each(markers, function(i,item) {
      x += item.position.b;
      y += item.position.d;
      totCount++;
   });
   avgX = x/totCount;
   avgY = y/totCount;
   map.panTo(new google.maps.LatLng(avgX,avgY));
}

/**
For each location, add a row in search results
   item - location object from SF data API
   index - place of location in the order
*/
function addDataToDetails(item,index) {
   $('#detailPlaceholder').clone()
                           .attr('class','detail')
                           .removeAttr('id')
                           .text(item.locations)
                           .show()
                           .appendTo('#responseContainer')
                           .on('click', function(){
                              $.each(markers, function(i,item) {
                                 if (i == index) {
                                    item.setIcon('http://labs.google.com/ridefinder/images/mm_20_blue.png');
                                 } else {
                                    item.setIcon('http://labs.google.com/ridefinder/images/mm_20_red.png');
                                 }
                              });
                           });
}

/**
Given a film title, find all filming locations
   title - film title
*/
function findLocationsForFilm(title) {
   //http://data.sfgov.org/resource/yitu-d5am.json?title=180
   $.ajax({
      url: SFAPI,
      type: "get",
      data: {title:title},
      success: function(response) {
         //console.log(response);
         $('.detail').remove();
         clearMarkers();
         if (response.length > 0) {
            $.each(response, function(i, item) {
               //console.log(item);
               lookupPOI(item.locations)
               addDataToDetails(item,i);
            });
            $('#filmName').text(title);
            $('#responseContainer').show();
         } else {
            $('#responseContainer').hide();
         }
         setTimeout(function(){
            recenterMap();
         }, 1000);
      }
   });

}

$(function(){
   initialize();
});