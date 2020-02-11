const axios = require('axios');
var express = require('express');
const queries = require('./queries')
var app = express();
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = "975459361176-0lh8jpvfrk8rv9op4ucfd6j0i84p6bop.apps.googleusercontent.com"
const client = new OAuth2Client(CLIENT_ID);


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
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

app.listen(8000)