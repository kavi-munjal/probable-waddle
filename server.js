const { IncomingWebhook, WebClient } = require('@slack/client');

console.log('Getting started with Slack Developer Kit for Node.js');

const timeNotification = new IncomingWebhook('https://hooks.slack.com/services/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');
const currentTime = new Date().toTimeString();
timeNotification.send(`The current time is ${currentTime}`, (error, resp) => {
  if (error) {
    return console.error(error);
  }
  console.log('Notification sent');
});