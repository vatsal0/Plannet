const axios = require('axios');
var express = require('express');
const queries = require('./queries');
var hri = require('human-readable-ids').hri;
var bodyParser     =        require("body-parser");
var app = express();
const {OAuth2Client} = require('google-auth-library');
//const CLIENT_ID = "331697660397-knlnre8o1qb7qmpnds2j07nhsntmdp7e.apps.googleusercontent.com"//For server
const CLIENT_ID = "975459361176-0lh8jpvfrk8rv9op4ucfd6j0i84p6bop.apps.googleusercontent.com"
const client = new OAuth2Client(CLIENT_ID);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function(req, res, next) { 
  res.header("Access-Control-Allow-Origin", "* ");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.get('/', function(req, res) {
    res.send("Hey buddy")
})

app.get('/verify/:id', function(req, res) {
  var token = req.params.id
  async function verify() {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, 
    });
    const payload = ticket.getPayload();
    const name = payload.name;
    const image = payload.picture;
    const userid = payload.sub;
    const email = payload.email;
    axios({
      method: 'post',
      url: 'https://us1.prisma.sh/vatsal-baherwani/Plannet/dev',
      data: {query: queries.LOGIN, variables: {id: userid, name: name, img: image, email: email}},
      headers: { 'Content-Type': 'application/json' },
      responseType: "json",
    })
    .then(function (response) {
      res.send(JSON.stringify(response.data.data.upsertUser));
    })
    .catch(function(error) {
      console.log(error);
    });
  }
  verify().catch(console.error);
});

app.post('/create', function(req, res) {
  let userid = req.body.userid;
  let joinCode = hri.random();
  let name = "New Group"; 
  axios({
    method: 'post',
    url: 'https://us1.prisma.sh/vatsal-baherwani/Plannet/dev',
    data: {query: queries.NEW_GROUP, variables: {id: userid, name: name, code: joinCode}},
    headers: { 'Content-Type': 'application/json' },
    responseType: "json",
  })
  .then(function (response) {
    res.send(response.data.data.createGroup.users[0]);
  })
  .catch(function(error) {
    console.log(error);
  });
});

app.post('/userinfo', function(req, res) {
  let userid = req.body.userid;
  axios({
    method: 'post',
    url: 'https://us1.prisma.sh/vatsal-baherwani/Plannet/dev',
    data: {query: queries.USER_INFO, variables: {id: userid}},
    headers: { 'Content-Type': 'application/json' },
    responseType: "json",
  })
  .then(function (response) {
    res.send(response.data.data.users[0]);
  })
  .catch(function(error) {
    console.log(error);
  });
});

app.post('/groupname', function(req, res) {
  let groupid = req.body.id;
  let newName = req.body.name
  axios({
    method: 'post',
    url: 'https://us1.prisma.sh/vatsal-baherwani/Plannet/dev',
    data: {query: queries.CHANGE_GROUP_NAME, variables: {id: groupid, newname: newName}},
    headers: { 'Content-Type': 'application/json' },
    responseType: "json",
  })
  .then(function (response) {
    res.send(response.data.data.updateGroup);
  })
  .catch(function(error) {
    console.log(error);
  });
});

app.post('/join', function(req, res) {
  let code = req.body.code;
  let userid = req.body.userid;
  axios({
    method: 'post',
    url: 'https://us1.prisma.sh/vatsal-baherwani/Plannet/dev',
    data: {query: queries.JOIN_GROUP, variables: {userid: userid, groupcode: code}},
    headers: { 'Content-Type': 'application/json' },
    responseType: "json",
  })
  .then(function (response) {
    if (response.data.errors) {
      res.send(["none"])
    }else {
      res.send(response.data.data.updateGroup.users);
    }
  })
  .catch(function(error) {
    console.log(error);
  });
});

app.post('/newhangout', function(req, res) {
  let groupid = req.body.groupid;
  let location = req.body.location;
  let time = req.body.time;
  let placeName = req.body.name;
  axios({
    method: 'post',
    url: 'https://us1.prisma.sh/vatsal-baherwani/Plannet/dev',
    data: {query: queries.CREATE_HANGOUT, variables: {groupid: groupid, location: location, time: time, name: placeName}},
    headers: { 'Content-Type': 'application/json' },
    responseType: "json",
  })
  .then(function (response) {
    res.send(response.data.data.updateGroup);
  })
  .catch(function(error) {
    console.log(error);
  });
});

app.post('/hangoutinfo', function(req, res) {
  let id = req.body.id;
  axios({
    method: 'post',
    url: 'https://us1.prisma.sh/vatsal-baherwani/Plannet/dev',
    data: {query: queries.HANGOUT_INFO, variables: {id:id}},
    headers: { 'Content-Type': 'application/json' },
    responseType: "json",
  })
  .then(function (response) {
    res.send(response.data.data.hangouts[0]);
  })
  .catch(function(error) {
    console.log(error);
  });
});

app.post('/commit', function(req, res) {
  let userid = req.body.userid;
  let hangoutid = req.body.hangoutid;
  axios({
    method: 'post',
    url: 'https://us1.prisma.sh/vatsal-baherwani/Plannet/dev',
    data: {query: queries.COMMIT, variables: {userid:userid, hangoutid:hangoutid}},
    headers: { 'Content-Type': 'application/json' },
    responseType: "json",
  })
  .then(function (response) {
    res.send(response.data.data.updateHangout);
  })
  .catch(function(error) {
    console.log(error);
  });
});

app.post('/decommit', function(req, res) {
  let userid = req.body.userid;
  let hangoutid = req.body.hangoutid;
  axios({
    method: 'post',
    url: 'https://us1.prisma.sh/vatsal-baherwani/Plannet/dev',
    data: {query: queries.DECOMMIT, variables: {userid:userid, hangoutid:hangoutid}},
    headers: { 'Content-Type': 'application/json' },
    responseType: "json",
  })
  .then(function (response) {
    res.send(response.data.data.updateHangout);
  })
  .catch(function(error) {
    console.log(error);
  });
});

app.listen(8000)