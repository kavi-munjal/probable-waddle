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

//JUST FOR TESTING
let usertoken;

console.log(authUrl);

function makeCalendarAPICall(token) {

  oAuth2Client.setCredentials(token);

  oAuth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
      // store the refresh_token in my database!
      console.log(tokens.refresh_token);
    }
    console.log(tokens.access_token);
  });

  const calendar = google.calendar({version: 'v3', auth: oAuth2Client});
  calendar.events.insert({
    auth: oAuth2Client,
    calendarId: 'primary', // Go to setting on your calendar to get Id
    resource: {
      'summary': 'Tell Luca he is beautiful',
      'description': 'He really, really is',
      'start': {
        'date': '2018-07-25',
        'timeZone': 'America/Los_Angeles'
      },
      'end': {
        'date': '2018-07-25',
        'timeZone': 'America/Los_Angeles'
      },
    }
  }, (err, {data}) => {
    if (err) return console.log('The API returned an error: ' + err);
    else console.log(data)
  });
  return;

}

app.get("/google/callback", (req, res) => {
  console.log(req.query);

  oAuth2Client.getToken(req.query.code, (err, token) => {
    if (err) return callback(err);
    oAuth2Client.setCredentials(token);
    usertoken = token;
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
  res.end();
});

app.post('/slack', function(req, res) {
  console.log(JSON.parse(req.body.payload))
  if (JSON.parse(req.body.payload).actions[0].name === 'yes') {
    console.log('confirmed')
      makeCalendarAPICall(usertoken)
  }
  res.end();
});

module.exports = {app: app, auth: authUrl}
