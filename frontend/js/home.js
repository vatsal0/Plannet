let userdata;

function updateGroupBox(groups) {
    $("#groups-box").empty();
    if (groups.length > 0) {
        $("#group-info").css('visibility','visible')
        updateGroupInfo(groups[0]);
    } else {
        $("#group-info").css('visibility','hidden')
        $("#groups-box").append('<li class="list-group-item disabled">You are in no groups right now. Join one or create your own!</li>')
    }
    for (let i = 0; i < groups.length; i++) {
        let nextHangoutText = "None";
        if (groups[i].hangouts.length > 0) {
            nextHangoutText = "Sometime soon"
        }
        //$('html here') to parse
        let groupButton = $('<button type="button" class="list-group-item list-group-item-action" id='+i+'><h6>'+groups[i].name+'</h6><p>'+groups[i].users.length+' member(s)</p><h6>Next hangout:</h6><p>'+nextHangoutText+'</p></button>')
        groupButton.click(function(){
            updateGroupInfo(groups[groupButton.attr('id')]);
        })
        $("#groups-box").append(groupButton);
    }
}

function updateGroupInfo(group) {
    $("#group-name").text(group.name);
    $("#group-code").text("Join code: " + group.code);
    $("#members-box").empty()
    for(let i = 0; i < group.users.length; i++) {
        console.log($("members-box"));
        $("#members-box").append('<li class="list-group-item"; style="display: flex; flex-direction: row;"><img src="'+group.users[i].image+'" style="width: 50px;"></img><h4>'+group.users[i].name+'</h4><h6>'+group.users[i].email+'</h6></li>');
    }
}

$(document).ready(async function() {
    userdata = await JSON.parse(window.localStorage.getItem("UserData"));
    $("#group-name").attr("contenteditable", "true")
    $("#group-name").focusout(function(){
        print("focus pocus");
    })
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