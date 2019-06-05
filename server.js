// server.js
const express        = require('express');
var cors             = require('cors')
const bodyParser     = require('body-parser');
const app            = express();
const request        = require('request');
const qs             = require('qs');
var querystring      = require('querystring');
const rp             = require('request-promise');
const nodemailer     = require("nodemailer");

var configFile = require('./config.js');

//restrict CORS to hosts listed in config.js file
var corsOptions ={
  "origin": '*',//configFile.hosts,
  "preflightContinue": true,
  "credentials":true
}

app.use(cors(corsOptions))

const tenant_url =configFile.tenant_url;
const port =configFile.port;
const smtp = configFile.smtp;
const smtp_port = configFile.smtp_port;
const smtp_user = configFile.smtp_user;
const smtp_pass = configFile.smtp_pass;
var https = require('https')

var fs = require("fs");
var hskey = fs.readFileSync('ca.key');
var hscert = fs.readFileSync('ca.crt');
var options = {
    key: hskey,
    cert: hscert
};

// listen for new web clients:
//app.listen(port, () => {
// console.log("Server running on port: "+port);
//});

var server = https.createServer(options,app)
//var io = require('socket.io').listen(server);
// listen for new web clients:
server.listen(port);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// GET method route
app.get('/', function (req, res) {
  res.send('GET request to the homepage')
})



app.post('/email', cors(corsOptions),function (req, res) {
  console.log("email posted")
  //ignore SSL validation in case tenant uses self-signed cert
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
  var header=req.headers['authorization']||'',        // get the header
  token=header.split(/\s+/).pop(); //get the Agave API Token

  var agave_header = {
                      'accept': 'application/json',
	  	      'content-type': 'application/json; charset=utf-8',
	              'Authorization': 'Bearer ' + token
	              };
  var get_profile_options = {
		          url: "https://"+tenant_url+"/profiles/me",
		          headers: agave_header,
		          json: true
		        }
  //fetch agave profile
  rp.get(get_profile_options)
   .then(function (response) {
     console.log(response);
     if(response.result.email != null){
       var transporter = nodemailer.createTransport({
  		     host: smtp,
           port: smtp_port,
           secure: false
  	   });
       console.log(req.query)
  	   var mailOptions = {
  		     from: req.query.from,
  		     to: req.query.to,
  		     subject: req.query.subject,
  		     text: req.query.message
  	   };

  	   transporter.sendMail(mailOptions, function(error, info){
  	     if (error) {
  	       res.json({error: error});
  	       console.log(error);
        } else {
  	       res.json({success:  info.response});
  		     console.log('Email sent: ' + info.response);
        }
  	   });
     }
   })//end profile then
  .catch(function (err) {
     console.log(err)
     res.send(err)
   });//catch for profile fetch
})
