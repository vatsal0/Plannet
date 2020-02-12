function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    var id_token = googleUser.getAuthResponse().id_token;

    fetch("http://localhost:8000/verify/" + id_token, {
        method: "GET",
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    })
    .then(async function(data) {
        let json = await data.json();
        window.localStorage.setItem("UserData", JSON.stringify(json));
        window.location.href = "http://localhost:3000/home.html";
    })
    .catch((error) => {
    console.error('Error:', error);
    });
}