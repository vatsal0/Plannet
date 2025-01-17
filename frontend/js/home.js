let userdata;

let SERVER = "https://inexpensive-beam-acp7cy33yt.glitch.me/"
SERVER = "http://localhost:8000"
//You can 99% of the time rely on userdata to be up to date, but if it isn't just call this function again
function updateUserData() {
    let id = window.localStorage.getItem("UserId");
    if (!id) window.location.href = "/indiex.html"
     fetch(SERVER+"/userinfo/", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({userid: id})
    })
    .then(async function(data) {
        let json = await data.json();
        $("#user-image").attr("src", json.image);
        $("#user-heading").text("Welcome, " + json.name.split(" ")[0]);
        updateGroupBox(json.groups);
        userdata = json;
    })
    .catch((error) => {
    console.error('Error:', error);
    });
}

function updateGroupBox(groups) {
    //Get rid of old group list, and hide the name change menu
    $("#groups-box").empty();
    $("#name-change").css("visibility", "hidden");

    if (groups.length > 0) {
        //If there are groups, default the infobox to the first group 
        $("#group-info").css('visibility','visible')
        updateGroupInfo(groups[0]);
        window.localStorage.setItem("groupviewindex",0);
    } else {
        $("#group-info").css('visibility','hidden')
        $("#groups-box").append('<li class="list-group-item disabled">You are in no groups right now. Join one or create your own!</li>')
    }
    for (let i = 0; i < groups.length; i++) {
        let nextHangoutText = "None";
        if (groups[i].hangouts.length > 0) {
            //Get the first hangout from sorted order
            nextHangoutText = dateFromISO8601(sortedHangouts(groups[i].hangouts)[0].date) + " @ " + groups[i].hangouts[0].placeName;
        }
        //Create html element for group list entry
        let groupButton = $(
            `<button type="button" class="card" style="margin: 10px 5% 10px 5%; display: flex; flex-direction: row;" id=`+i+`>
                    <div style="width:40%; padding-left: 5%">
                        <h6 style="text-align: left">`+groups[i].name+`</h6>
                        <p style="text-align: left">`+groups[i].users.length+` member(s)</p>
                    </div>
                    <div>
                        <h6 style="text-align: left">Next hangout:</h6>
                        <p style="text-align: left">`+nextHangoutText+`</p>
                    </div>
                    
            </button>`)
        groupButton.click(function(){
            updateGroupInfo(groups[groupButton.attr('id')]);
            window.localStorage.setItem("groupviewindex", groupButton.attr('id'))
        })
        $("#groups-box").append(groupButton);
    }
}

//Helper function I stole from internet
function dateFromISO8601(isostr) {
    var parts = isostr.match(/\d+/g);
    return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]).toString().split(":00")[0];
}

function sortedHangouts(hangouts) {
    let list = [];
    //Simple insertion sort
    for (let i = 0; i < hangouts.length; i++) {
        let hangout = hangouts[i];
        let timestamp = Date.parse(hangout.date);
        //Subtract timezone offset, only show hangouts that have not already passed
        if (timestamp > Date.now()-(new Date()).getTimezoneOffset()*60000) {
            let insert
            for(insert = 0; insert <list.length; insert++) {
                if (timestamp < Date.parse(list[insert].date)) break;
            }
            list.splice(insert,0,hangout);
        }
    }
    return list;
}

function updateGroupInfo(group) {
    $("#group-name").text(group.name);
    $("#group-code").text("Join code: " + group.code);
    $("#members-box").empty()
    $("#hangouts-box").empty()
    for(let i = 0; i < group.users.length; i++) {
        //Append list element of group user info
        $("#members-box").append(`
        <li class="list-group-item"; style="display: flex; flex-direction: row; height: 20%; margin: 5% 5% 0% 5%">
            <img src="`+group.users[i].image+`" style="height: 100%; border-radius: 100%; margin: 0% 5% 0% -5%"></img>
            <div style="display: flex; flex-direction: column">
                <div style="flex-shrink:1; flex-grow: 1; height: 50%; text-overflow: ellipsis; overflow: hidden; white-space: nowrap">
                `+group.users[i].name+`
                </div>
                <div style="flex-shrink:1; flex-grow:1; height: 50%; font-size: 0.5rem">
                <p>`+group.users[i].email+`</p>
                </div>
                
            </div>
        </li>`);
    }
    //Sort hangouts and create list elements for each one
    let hangouts = sortedHangouts(group.hangouts)
    for(let i = 0; i < hangouts.length; i++) {
        let date = dateFromISO8601(hangouts[i].date);
        let suf = "people";
        if (hangouts[i].committedUsers.length<=1) suf = "person";
        let text = hangouts[i].committedUsers.length + " " + suf
        if (hangouts[i].committedUsers.length==0) text = "No one yet";
        $("#hangouts-box").append(`
        <li class="list-group-item"; style="display: flex; flex-direction: row; height: 23%; margin: 5% 5% 0% 5%">
            <div>
                <p style="text-overflow: ellipsis; overflow: hidden; height: 40%; width: 100%">`+hangouts[i].placeName+`</p>
                <div style="display: flex; flex-direction: row; height: 50%; justify-content: space-between">
                    <p style="font-size: 0.6rem;">`+date+`</p>
                    <p style="font-size: 0.6rem">`+text +`</p>
                    <button style="height:80%; text-align: center" class="blue btn" id="view-`+i+`"><p style="margin-top: -25%">View</p></button>
                </div>
            </div>
        </li>`);
        //Button links to the specific hangout page
        $("#view-"+i).click(function() {
            window.location.href = "/hangout.html?id=" + hangouts[i].id;
        });
    }
}

$(document).ready(async function() {
    //Just binding button events here
    $("#name-change").submit(function(e) {
        //Fuck a form submit we out here doing dynamic updating
        e.preventDefault()
    })
    $("#edit-name").click(function(){
        $("#name-change").css("visibility", "visible");
    });
    $("#new-hangout").click(function(){
        window.location.href = "/create.html";
    });
    $("#name-change-button").click(function(){
        let newName = $("#name-input-box").val();
        if (newName.trim() != "") {
            //This will actually change the name of whatever group you have selected, not necessarily the one you clicked edit on
            //Too lazy to create another variable
            let groupId = userdata.groups[window.localStorage.getItem("groupviewindex")].id;
            fetch(SERVER+"/groupname/", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id: groupId, name: newName})
            })
            .then(async function(data) {
                updateUserData();
            })
            .catch((error) => {
            console.error('Error:', error);
            });
        } 
    });
    $("#join-button").click(function(){
        let joinCode = $("#join-code").val();
        let userId = userdata.googleid;
        console.log(userId, joinCode)
        fetch(SERVER+"/join/", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({userid: userId, code: joinCode})
        })
        .then(async function(data) {
            let json = await data.json();
            if (json[0] != "none") {
                //Join success
                updateUserData();
            } else {
                //There was an invalid code, do something.
            }
        })
        .catch((error) => {
        console.error('Error:', error);
        });
    })
    $("#create-button").click(function(){
        fetch(SERVER+"/create/", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({userid: userdata.googleid})
        })
        .then(async function(data) {
            updateUserData();
        })
        .catch((error) => {
        console.error('Error:', error);
        });
    });
    updateUserData();
});