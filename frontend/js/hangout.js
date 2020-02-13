//Another helper function from internet, it retrieves the little parameter when you do example.com?variable=something
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function dateFromISO8601(isostr) {
    var parts = isostr.match(/\d+/g);
    return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]).toString().split(":00 ")[0];
}

$(document).ready(function(){
    let x,y,date,name,users;
    let id = getParameterByName("id");
    fetch("http://localhost:8000/hangoutinfo/", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({id: id})
    })
    .then(async function(data) {
        let json = await data.json();
        let coords = json.location;
        //Coordinates are stored in the form "69, 69" because that's just how arrays convert
        x = parseFloat(coords.split(",")[0]);
        y = parseFloat(coords.split(",")[1]);
        date = dateFromISO8601(json.date);
        name = json.placeName;
        users = json.committedUsers;
        let peopleString = "";
        for (let i = 0; i < users.length; i++) {
            peopleString += users[i].name;
            if (i != users.length - 1) peopleString += ", ";
        }
        if (users.length == 0) peopleString = "No one is coming yet"; else peopleString += " will come";

        $("#commits").text(peopleString);
        $("#place").text(name);
        $("#time").text(date);

        let googleid = window.localStorage.getItem("UserId");
        let userDidCommit = false
        for (let i = 0; i < users.length; i++) {
            //If user shows up in list of commits, they committed
            if (users[i].googleid == googleid) userDidCommit = true;
        }
        if (userDidCommit) $("#commit").hide(); else $("#decommit").hide();

        $("#commit").click(function() {
            fetch("http://localhost:8000/commit/", {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({userid: googleid, hangoutid: id})
            })
            .then(async function(data) { 
                let json = await data.json();
                location.reload();
            })
            .catch((error) => {
            console.error('Error:', error);
            });
        });
        $("#decommit").click(function() {
            fetch("http://localhost:8000/decommit/", {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({userid: googleid, hangoutid: id})
            })
            .then(async function(data) { 
                let json = await data.json();
                location.reload();
            })
            .catch((error) => {
            console.error('Error:', error);
            });
        });
        
        //Map api stuff, pretty straightforward I just pasted it
        mapboxgl.accessToken = 'pk.eyJ1IjoiZmF0c2FsIiwiYSI6ImNrNmlhbDl4ajE1cnkzbm9lcHMyMm5ucWsifQ.5jnQlCJzK6e3DuiYQCk4VQ';
        var map = new mapboxgl.Map({
            container: 'map', // Container ID
            style: 'mapbox://styles/mapbox/streets-v11', // Map style to use
            center: [x,y], // Starting position [lng, lat]
            zoom: 15, // Starting zoom level
        });
        //10 - base search
        //15 - hangout view

        var marker = new mapboxgl.Marker() // initialize a new marker
        .setLngLat([x,y]) // Marker [lng, lat] coordinates
        .addTo(map); // Add the marker to the map
    })
    .catch((error) => {
    console.error('Error:', error);
    });
});