let loc, placeName, userdata;

function updateUserData() {
    fetch("http://localhost:8000/userinfo/", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({userid: window.localStorage.getItem("UserId")})
    })
    .then(async function(data) {
        let json = await data.json();
        userdata = json;
    })
    .catch((error) => {
    console.error('Error:', error);
    });
}

$(document).ready(function(){
    updateUserData();
    mapboxgl.accessToken = 'pk.eyJ1IjoiZmF0c2FsIiwiYSI6ImNrNmlhbDl4ajE1cnkzbm9lcHMyMm5ucWsifQ.5jnQlCJzK6e3DuiYQCk4VQ';
    var map = new mapboxgl.Map({
        container: 'map', // Container ID
        style: 'mapbox://styles/mapbox/streets-v11', // Map style to use
        center: [-74.076574, 40.916432], // Starting position [lng, lat]
        zoom: 14, // Starting zoom level
    });
    //10 - base search
    //15 - hangout view
    
    var geocoder = new MapboxGeocoder({ // Initialize the geocoder
    accessToken: mapboxgl.accessToken, // Set the access token
    mapboxgl: mapboxgl, // Set the mapbox-gl instance
    marker: true, // Do not use the default marker style
    placeholder: "Where we posting up?"
    });
    
    geocoder.on('result', function(e) {
        //Just api stuff, you can console.log if you want to see all the info
        let info = e.result;
        placeName = info.text;
        if (info.address) placeName = info.address + " " + placeName;
        loc = info.center;
        //console.log(info);
    });
    
    // Add the geocoder to the map
    map.addControl(geocoder);
    $("#create-button").click(function(){
        let time = $("#time").val();
        if (time != "" && loc != null) {
            let groupindex = window.localStorage.getItem("groupviewindex");
            console.log(loc, time)
            fetch("http://localhost:8000/newhangout/", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({groupid: userdata.groups[groupindex].id, location: loc.toString(), time: time, name: placeName})
            })
            .then(async function(data) {
                let json = await data.json();
                userdata.groups[groupindex].hangouts = json.hangouts;
                let hangoutid = json.hangouts[json.hangouts.length-1].id;
                window.location.href = "http://localhost:3000/hangout.html?id="+hangoutid;
            })
            .catch((error) => {
            console.error('Error:', error);
            });
        
        } else {alert("Please fill out a time and a place.")}
    });
    
})