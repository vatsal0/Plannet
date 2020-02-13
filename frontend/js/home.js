let userdata;

function updateUserData() {
    fetch("http://localhost:8000/userinfo/", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({userid: userdata.googleid})
    })
    .then(async function(data) {
        let json = await data.json();
        window.localStorage.setItem("UserData", JSON.stringify(json));
        userdata = json;
        updateGroupBox(userdata.groups);
    })
    .catch((error) => {
    console.error('Error:', error);
    });
}

function updateGroupBox(groups) {
    $("#groups-box").empty();
    $("#name-change").css("visibility", "hidden");
    if (groups.length > 0) {
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
            nextHangoutText = "Sometime soon"
        }
        let groupButton = $('<button type="button" class="list-group-item list-group-item-action" id='+i+'><h6>'+groups[i].name+'</h6><p>'+groups[i].users.length+' member(s)</p><h6>Next hangout:</h6><p>'+nextHangoutText+'</p></button>')
        groupButton.click(function(){
            updateGroupInfo(groups[groupButton.attr('id')]);
            window.localStorage.setItem("groupviewindex", groupButton.attr('id'))
        })
        $("#groups-box").append(groupButton);
    }
}

function dateFromISO8601(isostr) {
    var parts = isostr.match(/\d+/g);
    return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]).toString().split(":00")[0];
}

function sortedHangouts(hangouts) {
    let list = [];
    for (let i = 0; i < hangouts.length; i++) {
        let hangout = hangouts[i];
        let timestamp = Date.parse(hangout.date);
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
        $("#members-box").append(`
        <li class="list-group-item"; style="display: flex; flex-direction: row;">
            <img src="`+group.users[i].image+`" style="width: 50px;"></img>
            <div style="display: flex; flex-direction: column">
                <h4>`+group.users[i].name+`</h4>
                <h6>`+group.users[i].email+`</h6>
            </div>
        </li>`);
    }
    let hangouts = sortedHangouts(group.hangouts)
    for(let i = 0; i < hangouts.length; i++) {
        let date = dateFromISO8601(hangouts[i].date);
        $("#hangouts-box").append(`
        <li class="list-group-item"; style="display: flex; flex-direction: row;">
            <div style="display: flex; flex-direction: column">
                <h4>`+hangouts[i].placeName+`</h4>
                <div style="display: flex; flex-direction: row">
                    <h6>`+date+`</h6>
                    <h4>`+hangouts[i].committedUsers.length+` people</h4>
                    <button type="button" class="btn btn-primary" id="view-`+i+`">View</button>
                </div>
            </div>
        </li>`);

        $("#view-"+i).click(function() {
            window.location.href = "/hangout.html?id=" + hangouts[i].id;
        });
    }
}

$(document).ready(async function() {
    userdata = await JSON.parse(window.localStorage.getItem("UserData"));
    $("#name-change").submit(function(e) {
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
            let groupId = userdata.groups[window.localStorage.getItem("groupviewindex")].id;
            fetch("http://localhost:8000/groupname/", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id: groupId, name: newName})
            })
            .then(async function(data) {
                let json = await data.json();
                userdata.groups[window.localStorage.getItem("groupviewindex")].name = json.name;
                window.localStorage.setItem("UserData", userdata);
                updateGroupBox(userdata.groups);
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
        fetch("http://localhost:8000/join/", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({userid: userId, code: joinCode})
        })
        .then(async function(data) {
            let json = await data.json();
            if (json[0] != "none") {
                updateUserData();
                window.localStorage.setItem("UserData", userdata);
                updateGroupBox(userdata.groups);
            }

            
        })
        .catch((error) => {
        console.error('Error:', error);
        });
    })


    updateUserData();
    $("#user-heading").text("Welcome, " + userdata.name.split(" ")[0]);
    let groups = userdata.groups;
    updateGroupBox(groups);
    $("#create-button").click(function(){
        fetch("http://localhost:8000/create/", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({userid: userdata.googleid})
        })
        .then(async function(data) {
            let json = await data.json();
            window.localStorage.setItem("UserData", JSON.stringify(json));
            userdata = json;
            updateGroupBox(json.groups);
        })
        .catch((error) => {
        console.error('Error:', error);
        });
    });
});