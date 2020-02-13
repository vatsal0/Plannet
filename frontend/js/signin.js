let SERVER = "https://inexpensive-beam-acp7cy33yt.glitch.me/"
//SERVER = "http://localhost:8000"

function onSignIn(googleUser) {
    //Generate an authenticated token to be verified by the server
    var id_token = googleUser.getAuthResponse().id_token;

    //Verify the user before proceeding
    fetch(SERVER+"/verify/" + id_token, {
        method: "GET",
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    })
    .then(async function(data) {
        let json = await data.json();
        //Save the user's google account ID to fetch data later
        window.localStorage.setItem("UserId", json.googleid);
        window.localStorage.setItem("UserData", JSON.stringify(json));
        window.location.href = "/home.html";
    })
    .catch((error) => {
    console.error('Error:', error);
    });
}