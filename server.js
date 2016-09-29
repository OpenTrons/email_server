var express= require("express")
var app = express()
var bodyParser = require("body-parser")
var helper = require('sendgrid').mail;
var fs = require('fs')

app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "Origin, X-Requested-With, Content-Type, Accept");
    console.log(req.body)
    next();
});

app.post("/", function(req, res) {
  if(req.body.type == "message") {
    var subject = `Message from ${req.body.name}`
  } else {
    var subject = `Demo Request from ${req.body.name}`
  }

  var from_email = new helper.Email(req.body.email);
  var to_email = new helper.Email('info@opentrons.com');
  var content = new helper.Content('text/plain', `New ${subject} from ${req.body.name}.\n\nEmail address: ${req.body.email}.\n\nMessage:\n\n${req.body.message}`);
  if(req.body.organization) { subject += ` at ${req.body.organization}` };
  sendEmail(from_email, subject, to_email, content);
})

app.post('/specsheet', function(req, res) {
  var from_email = new helper.Email("info@opentrons.com");
  var to_email = new helper.Email(req.body.email);
  var content = new helper.Content('text/plain', "Attached is the specsheet for the Opentrons.");
  sendEmail(from_email, "Opentrons Specsheet", to_email, content);
})

function sendEmail(from_email, subject, to_email, content) {
  var mail = new helper.Mail(from_email, subject, to_email, content);
  var sg = require('sendgrid')(process.env.SENDFRID_API_KEY)
  var request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON(),
  });

  sg.API(request, function(error, response) {
    console.log(response.statusCode);
    console.log(response.body);
    console.log(response.headers);
  });

  var resultMessage = {
    "success": `POST Successfull. RequestBody: ${req.body}`,
    "status": 200
  }

  res.end(JSON.stringify(resultMessage));
}

var https = require('https');
var httpsPort = 3000;
var options = {
  key: fs.readFileSync('./private.key'),
  cert: fs.readFileSync('./certificate.pem')
};
var secureServer = https.createServer(options, app).listen(httpsPort);
