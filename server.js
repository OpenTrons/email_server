"use strict"
const express= require("express")
const app = express()
const bodyParser = require("body-parser")
const helper = require('sendgrid').mail;
const fs = require('fs')

app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get("/", function(req, res) {
  let resultMessage = {
    "success": `GET Successful. RequestBody: ${req.body}`,
    "status": 200
  }
  res.end(JSON.stringify(resultMessage));
})

app.post("/", function(req, res) {
  console.log(req.body)
  let subject = "User Message"
  if(req.body.type == "message" && typeof(req.body.name) != undefined ) {
    subject = `Message from ${req.body.name}`
  } else {
    subject = `Demo Request from ${req.body.name}`
  }

  let from_email = new helper.Email(req.body.email);
  let to_email = new helper.Email('info@opentrons.com');
  let content = new helper.Content('text/plain', `New ${subject}.\n\nEmail address: ${req.body.email}.\n\nMessage:\n\n${req.body.message}`);
  if(req.body.organization) { subject += ` at ${req.body.organization}` };
  let receipt = new helper.Content('text/plain', `This email is a confirmation that the following message was recieved: \n\n${req.body.message}`)
  sendEmail(from_email, subject, to_email, content, receipt);

  let resultMessage = {
    "success": `POST Successful. RequestBody: ${req.body}`,
    "status": 200
  }

  res.end(JSON.stringify(resultMessage));
})

app.post('/specsheet', function(req, res) {
  let from_email = new helper.Email("info@opentrons.com");
  let to_email = new helper.Email(req.body.email);
  let content = new helper.Content('text/html', "Thank you for requesting an Opentrons robot spec sheet (see file link below). If you have any more questions about the robots, protocols, web demos, or anything else on our website, don't hesistate to reach out to us on <a href='mailto:info@opentrons.com'>info@opentrons.com</a>!! <br><br><a href='https://s3-us-west-2.amazonaws.com/ot-blog-files/Opentrons_Brochure.pdf'>Click here for the specification sheet.</a>");
  console.log(from_email)
  let subject = "Opentrons Spec Sheet Request " + req.body.email.split("@")[0];
  let receipt = new helper.Content('text/plain', `This email is a confirmation that the following message was recieved: ${req.body.message}`)
  sendEmail(from_email, subject, to_email, content, receipt);

  let resultMessage = {
    "success": `POST Successful. RequestBody: ${JSON.stringify(req.body)}`,
    "status": 200
  }

  res.end(JSON.stringify(resultMessage));
})

function sendEmail(from_email, subject, to_email, content, receipt) {
  let mail = new helper.Mail(from_email, subject, to_email, content);
  let receiptSubject = "Confirmation: Message recieved by Opentrons team"
  let receiptMail = new helper.Mail(to_email, receiptSubject, from_email, receipt);
  let sg = require('sendgrid')(process.env.SENDGRID_API_KEY)
  let request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON(),
  });

  let receiptRequest = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: receiptMail.toJSON(),
  });

  sg.API(request, function(error, response) {
    console.log(response.statusCode);
    console.log(response.body);
    console.log(response.headers);
  });
  sg.API(receiptRequest, function(error, response) {
    console.log(response.statusCode);
    console.log(response.body);
    console.log(response.headers);
  });
}

let https = require('https');
let httpsPort = 3000;
let options = {
  key: fs.readFileSync('./private.key'),
  cert: fs.readFileSync('./certificate.pem')
};
let secureServer = https.createServer(options, app).listen(httpsPort);

// app.listen(3000)
