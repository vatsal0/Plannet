$(document).ready(async function() {
    let userdata = await JSON.parse(window.localStorage.getItem("UserData"));
    $("#user-heading").text("Welcome, " + userdata.name.split(" ")[0])
});