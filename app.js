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
    return new Promise((resolve, reject) => {
      client.refreshAccessToken((err, token) => {
        if(err) reject(err)
        resolve(token)
      })
    })
    return newToken;
  }

  // let auth = authUrl('UBWD1U74P');

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
        'summary': data.name,
        // 'description': 'He really, really is',
        'start': {
          'date': data.date,
          'timeZone': 'America/Los_Angeles'
        },
        'end': {
          'date': data.date,
          'timeZone': 'America/Los_Angeles'
        },
      }
    })
  }



  app.post('/slack', function(req, res) {
    console.log("THIS", req.body.payload)
    const payload = JSON.parse(req.body.payload)
    if (payload.actions[0].name === 'yes') {
      console.log('confirmed')
      let user = payload.user.id;
      let data = payload.action
      User.findOne({ slackId: user }, async(err, user) => {
        if (err) console.log(err);
        else {
          // if (user.googleTokens.expiry_date < Date.now() + 60000 ) {
            console.log(user.googleTokens);
            let token = await refreshToken(user.googleTokens)
            console.log('hey', token);
            user.googleTokens = token;
            await user.save((err) => {
              if (err) console.log(err);
            });
          // }
          makeCalendarAPICall(user.googleTokens, payload.actions[0].value)
        }
      })
      res.end();
    }
  })

  app.get("/google/callback", (req, res) => {
    console.log(req.query);

    getToken(req.query.code, (err, token) => {
      let user = new User({
        slackId: req.query.state,
        googleTokens: token
      })
      user.save();
    });
    res.send('Congratulations! You have successfully linked your Google Calendar!');
  });

  module.exports = {app: app, auth: authUrl, getToken: getToken, refreshToken: refreshToken}
