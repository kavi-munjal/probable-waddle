const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();

const { IncomingWebhook, WebClient } = require('@slack/client');
const bot = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);

app.use(express.static(path.join(__dirname, 'build')));

app.use(bodyParser.json())

app.get('/ping', function (req, res) {
 return res.send('pong');
});

app.listen(process.env.PORT || 3000);


const introMsg = `Hey Jay, I'm Scheduler Bot, our team's scheduling assistant. It's nice to be here at Horizons.
I can create reminders:
   remind me to do laundry tomorrow
I can schedule meetings:
   schedule a meeting between me and Darwish on Thursday 5pm

To really do a good job, I need your permission to access your calendar. I won't be sharing any information with others, I just need to check when you're busy or free to meet.

Please sign up with this link to connect your calendars: http://localhost:3000/ping
`;

bot.send(introMsg, (error, resp) => {
  if (error) {
    return console.error(error);
  }
  console.log('Notification sent');
});
