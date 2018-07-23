const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const dialogflow = require('dialogflow');

const app = express();

const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const sessionId = 'quickstart-session-id';
const query = 'hello';
const languageCode = 'en-US';

const sessionClient = new dialogflow.SessionsClient();
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

const request = {
  session: sessionPath,
  queryInput: {
    text: {
      text: query,
      languageCode: languageCode,
    },
  },
};

sessionClient
  .detectIntent(request)
  .then(responses => {
    console.log('Detected intent');
    const result = responses[0].queryResult;
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    if (result.intent) {
      console.log(`  Intent: ${result.intent.displayName}`);
    } else {
      console.log(`  No intent matched.`);
    }
  })
  .catch(err => {
    console.error('ERROR:', err);
  });

const { IncomingWebhook, WebClient, RTMClient } = require('@slack/client');
const token = process.env.SLACK_TOKEN;
//const bot = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);
const rtm = new RTMClient(token);
const web = new WebClient(token);
const channel = 'DBVG1LQR3';

rtm.start();

rtm.on('connected', (e) => {
  console.log('rtm connected to ', channel);
  rtm.sendMessage('whaddup. it\'s me bish. time to schedule some ish.', channel)
  .then(res=>{
    console.log('Message sent')
  })
  .catch(console.error);


  rtm.on('message', (message) => {
    if (message.user === rtm.activeUserId) {
      return;
    }
    var text = message.text.trim().toLowerCase();
    if(text.indexOf('remind') === 0){
      var task = text.split(' ');


    }
    if(message.text.toLowerCase().indexOf('schedule' === 0)){

    }

    rtm.sendMessage('do i look like i care', channel)
    .then(res=>{
      console.log('Message sent')
    })
    .catch(console.error);
  });

});

const introMsg = '';
// `Hey Jay, I'm Scheduler Bot, our team's scheduling assistant. It's nice to be here at Horizons.
// I can create reminders:
// remind me to do laundry tomorrow
// I can schedule meetings:
// schedule a meeting between me and Darwish on Thursday 5pm
//
// To really do a good job, I need your permission to access your calendar. I won't be sharing any information with others, I just need to check when you're busy or free to meet.
//
// Please sign up with this link to connect your calendars: http://localhost:3000/ping
// `;
