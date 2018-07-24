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

const { IncomingWebhook, WebClient, RTMClient } = require('@slack/client');
const token = process.env.SLACK_TOKEN;
//const bot = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);
const rtm = new RTMClient(token);
const web = new WebClient(token);
const channel = 'DBVG1LQR3';

rtm.start();

rtm.on('connected', (e) => {
  console.log('rtm connected to ', channel);

  rtm.sendMessage('whaddup. it\'s me bish. let\'s schedule some shit.', channel)
  .then(res=>{
    console.log('Message sent')
  })
  .catch(console.error);

  rtm.on('message', (message) => {
    // Skip messages that are from a bot or my own user ID
    if ( (message.subtype && message.subtype === 'bot_message') ||
         (!message.subtype && message.user === rtm.activeUserId) ) {
      return;
    }
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
