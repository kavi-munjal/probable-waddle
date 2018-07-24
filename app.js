const express = require('express');
const {google} = require('googleapis');
const bodyParser = require('body-parser')

const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.listen(process.env.PORT || 3000);

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URL);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
});

console.log(authUrl);

app.get("/google/callback", (req, res) => {
  console.log(req.query);

  oAuth2Client.getToken(req.query.code, (err, token) => {
    if (err) return callback(err);
    oAuth2Client.setCredentials(token);
    const calendar = google.calendar({version: 'v3', auth: oAuth2Client});
    calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const events = res.data.items;
      if (events.length) {
        console.log('Upcoming 10 events:');
        events.map((event, i) => {
          const start = event.start.dateTime || event.start.date;
          console.log(`${start} - ${event.summary}`);
        });
      } else {
        console.log('No upcoming events found.');
      }
    });
  });
});

app.post('/slack', function(req, res){
  console.log(req.body, req.query);
  res.end();
});

module.exports = {app: app, auth: authUrl}
