// global variables

// global map
var map;

// global marker
var Marker;

var clientID;
var clientSecret;

// locations array
var locations = [
    {title: 'macdonalds', location: {lat: 24.713384, lng: 46.633396}},
    {title: 'Shawarmer', location: {lat: 24.713122, lng: 46.633899}},
    {title: 'Riyad Bank', location: {lat: 24.714323, lng: 46.634152}},
    {title: 'SUBWAY', location: {lat: 24.714625, lng: 46.634592}},
    {title: 'Dunkin Donuts', location: {lat: 24.713335, lng: 46.634071}},
    {title: 'Extra', location: {lat: 24.712943, lng: 46.633025}},
    {title: 'Tamimi Markets', location: {lat: 24.713611, lng: 46.633948}}
];

Marker = function (data) {
    var self = this;

    this.title = data.title;
    this.position = data.location;
    this.infoWindowText = '';

    // foursquare api related information
    this.lat = data.location.lat;
    this.lng = data.location.lng;
    this.url = '';
    this.phone= '';
    this.address = '';
    clientID = 'E12RN3ZWBZ2E34J1I0URVZN4MKTW5JNWECTT2SO45QDIA510';
    clientSecret = 'NDOPPUOFKBMYKFLCZJKXD0V3CRQF00PEKGKMDDSU1BZY2XN5';

    var foursquareAPIurl = 'https://api.foursquare.com/v2/venues/search?ll=' + this.lat + ',' + this.lng + '&v=20161016' + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&query=' + this.title;

    // ajax request using jquery to retrieve the desired data and store it in the variables.

    $.getJSON(foursquareAPIurl).done(function (data) {
        var results = data.response.venues[0];
        self.url = results.url;
        if (typeof self.url === 'undefined') {
            self.url = "";
        }
        self.address = results.location.formattedAddress[0] || 'No Address Found';
        self.phone = (results.contact.phone || 'No Phone Found');
    }).fail(function () {
        $('#map').html('There is an error with foursquare api, please refresh the page');
    });


    this.visible = ko.observable(true);

    // infoWindow with the text
    this.infoWindow = new google.maps.InfoWindow({
        content: self.infoWindowText
    });

    // adds the marker into the map
    this.mapMarker = new google.maps.Marker({
        map: map,
        position: self.position,
        title: self.title,
        animation: google.maps.Animation.DROP,
    });



    // show and hide the marker
    this.show = ko.computed(function(){
        if(this.visible() === true)
            this.mapMarker.setMap(map);
        else
            this.mapMarker.setMap(null);
        return true;
    }, this);


    // click listener on the mapMarker
    this.mapMarker.addListener('click', function () {

        self.infoWindowText = '<div class="h6">'+this.title+'</div>' +
            '<p>'+self.phone+'</p>' +
            '<p>'+self.address+'</p>' +
            '<a href="'+self.url+'">'+self.url+'</a>';

        if (self.infoWindow.marker != self.mapMarker)
            self.infoWindow.marker = self.mapMarker;

        self.infoWindow.setContent(self.infoWindowText);

        self.infoWindow.open(map, this);

        self.mapMarker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.mapMarker.setAnimation(null);
        }, 1500);

    });

    this.trigger = function(marker) {
        google.maps.event.trigger(self.mapMarker, 'click');
    };

};

function ViewModel(){
    var self = this;

    // search filter
    this.filter = ko.observable();

    //markers array
    this.markersList = ko.observableArray([]);

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 17,
        center: {lat: 24.714178, lng: 46.632500}
    });

    // pushed the locations into the markers array
    locations.forEach(function(locationEl){
        self.markersList.push( new Marker(locationEl) );
    });

    // computed array with the search filter applied on
    this.visiblePlaces = ko.computed(function() {
        var newFilter = self.filter();
        if (!newFilter){
            self.markersList().forEach(function(markerEl){
                markerEl.visible(true);
            });
            return self.markersList();
        } else {
            newFilter = self.filter().toLowerCase();
            return ko.utils.arrayFilter(self.markersList(), function(markerEl) {
                var string = markerEl.title.toLowerCase();
                var result = (string.search(newFilter) >= 0);
                markerEl.visible(result);
                return result;
            });
        }
    });


}
function googleMapsAPIError(){
    $('#map').html('There is an error with google maps api, please refresh the page');
}

function initMap() {
    ko.applyBindings(new ViewModel());
}