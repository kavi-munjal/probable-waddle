const express = require('express');
const {google} = require('googleapis');
const bodyParser = require('body-parser');
const User = require('./models.js').User;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.listen(process.env.PORT || 3000);

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

function getClient() {
  return new google.auth.OAuth2(
      process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URL);
}

function authUrl(state) {
  return getClient().generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state
  });
}

function getToken(code, cb) {
  return getClient().getToken(code, cb);
}

function refreshToken(token) {
  let client = getClient();
  client.setCredentials(token);
  return client.refreshAccessToken((err, token) => {
    return token;
  })
}

console.log(authUrl('UBWD1U74P'))

//JUST FOR TESTING
// let usertoken;

// console.log(authUrl);

function makeCalendarAPICall(token, data) {
  let client = getClient();
  client.setCredentials(token);

  const calendar = google.calendar({version: 'v3', auth: client});
  // console.log(token);
  console.log(data);

  calendar.events.insert({
    auth: client,
    calendarId: 'primary', // Go to setting on your calendar to get Id
    'resource': {
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
  }, (err, resp) => {
    if (err) return console.log('The API returned an error: ' + err);
    console.log(resp)
  })
  return;
}

app.post('/slack', function(req, res) {
  console.log(JSON.parse(req.body.payload))
  const payload = JSON.parse(req.body.payload)
  if (payload.actions[0].name === 'yes') {
    console.log('confirmed')
    let user = payload.user.id;
    let data = payload.action
    User.findOne({ slackId: user }, (err, user) => {
      if (user.googleTokens.expiry_date < Date.now() + 60000 ) {
        let token = refreshToken(user.googleTokens)
        console.log(token);
        user.googleTokens = token;
        user.save((err) => {
          if (err) console.log(err);
        });
      }
      makeCalendarAPICall(user.googleTokens, 'hi')
    })
  }
  res.end();
})

app.get("/google/callback", (req, res) => {
  console.log(req.query);

  getToken(req.query.code, (err, token) => {
    let user = new User({
      slackId: req.query.state,
      googleTokens: token
    })
    user.save();
    // oAuth2Client.setCredentials(token);
    // usertoken = token;
    // const calendar = google.calendar({version: 'v3', auth: oAuth2Client});
    // calendar.events.list({
    //   calendarId: 'primary',
    //   timeMin: (new Date()).toISOString(),
    //   maxResults: 10,
    //   singleEvents: true,
    //   orderBy: 'startTime',
    // }, (err, res) => {
    //   if (err) return console.log('The API returned an error: ' + err);
    //   const events = res.data.items;
    //   if (events.length) {
    //     console.log('Upcoming 10 events:');
    //     events.map((event, i) => {
    //       const start = event.start.dateTime || event.start.date;
    //       console.log(`${start} - ${event.summary}`);
    //     });
    //   } else {
    //     console.log('No upcoming events found.');
    //   }
    // });
  });
  res.send('Congratulations! You have successfully linked your Google Calendar!');
});

module.exports = {app: app, auth: authUrl, getToken: getToken, refreshToken: refreshToken}
