const express = require('express');
const request = require('request')
const bodyParser = require('body-parser')
const path = require('path');
const dialogflow = require('dialogflow');
var http = require('https');
var querystring = require('querystring');
const { IncomingWebhook, WebClient, RTMClient } = require('@slack/client');

const app = express();

//clients setup
const token = process.env.SLACK_TOKEN;
const rtm = new RTMClient(token);
const web = new WebClient(token);


//dialogflow setup
const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const sessionId = 'quickstart-session-id';
const languageCode = 'en-US';
const sessionClient = new dialogflow.SessionsClient();
const sessionPath = sessionClient.sessionPath(projectId, sessionId);
//const bot = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);

rtm.start();

//need a way to find channel!!
const channel = 'DBVG1LQR3';

//connected event
rtm.on('connected', (e) => {
  console.log('rtm connected to ', channel);

  var button = [
      {
        "text": "button button button",
        "fallback": "nah fam",
        "color": "#3AA3E3",
        "attachment_type": "default",
        "callback_id": "test",
        "actions": [
          {
            "name": "yes",
            "text": "yeeee boi",
            "type": "button",
            "value": "yes"
          },
          {
            "name": "yes2",
            "text": "fuuk ya",
            "type": "button",
            "value": "yes2"
          },
        ]
      }
    ]

  web.chat.postMessage({
    token: token,
    channel: channel,
    attachments: JSON.stringify(button),
    text: "its a button, bish"
  });

  //connected response
  rtm.sendMessage('whaddup. it\'s me bish. let\'s schedule some shit.', channel)
  .then(res=>{
    console.log('Message sent')
  })
  .catch(console.error);

  //message event
  rtm.on('message', (message) => {
    // skip messages that are from a bot or my own user ID
    if ( (message.subtype && message.subtype === 'bot_message') ||
    (!message.subtype && message.user === rtm.activeUserId) ) {
      return;
    }

    //parse message
    var text = message.text.trim().toLowerCase();
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: text,
          languageCode: languageCode,
        },
      },
    };

    //respond with dialogflow
    sessionClient
    .detectIntent(request)
    .then(responses => {
      console.log('Detected intent');
      const result = responses[0].queryResult;
      console.log(`  Query: ${result.queryText}`);
      console.log(`  Response: ${result.fulfillmentText}`);
      if (result.intent) {
        console.log(`  Intent: ${result.intent.displayName}`);
        rtm.sendMessage(result.fulfillmentText, channel)
        .then(res=>{
          console.log('Message sent')
        })
        .catch(console.error);
      } else {
        console.log(`  No intent matched.`);
      }
    });
  });
});
