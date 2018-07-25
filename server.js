const express = require('express');
const request = require('request')
const path = require('path');
const dialogflow = require('dialogflow');
var http = require('https');
var querystring = require('querystring');
const { IncomingWebhook, WebClient, RTMClient } = require('@slack/client');

const app = require('./app.js').app;

const auth = require('./app.js').auth;

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

rtm.start();

//connected event
rtm.on('connected', (event) => {

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

  // web.chat.postMessage({
  //   token: token,
  //   channel: channel,
  //   attachments: JSON.stringify(button),
  //   text: "its a button, bish"
  // });

  // connected response-- fine channel???
  // rtm.sendMessage('whaddup. it\'s me bish. let\'s schedule some shit. click dis: ' + auth, channel)
  // .then(res=>{
  //   console.log('Message sent')
  // })
  // .catch(console.error);

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
        if(result.parameters.fields.name && result.parameters.fields["date-time"]) {
          var name = result.parameters.fields.name.stringValue;
          var date = new Date(result.parameters.fields["date-time"].stringValue).toDateString();
          var button = [
              {
                "text": `so you want me to tell you to ${name} at ${date}, jah?`,
                "fallback": "error",
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
                    "name": "no",
                    "text": "nah fam",
                    "type": "button",
                    "value": "no"
                  },
                ]
              }
            ]
          web.chat.postMessage({
            token: token,
            channel: message.channel,
            attachments: JSON.stringify(button),
            text: "confirm"
          });
        }
        rtm.sendMessage(result.fulfillmentText, message.channel)
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
