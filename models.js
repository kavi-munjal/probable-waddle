const mongoose = require('mongoose');

const connect = process.env.MONGODB_URI;
mongoose.connect(connect);

const taskSchema = mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  day: {
    type: String,
    required: true,
  },
  eventId: String,
  requesterId: String
})

const userSchema = mongoose.Schema({
  tokens: {
    accessToken: String,
    refreshToken: String,
  }
  googleId: String,
  defaultSetting: {
    meetingLength: 30
  },
  slackId: String,
  slackUsername: String,
  slackEmail: String,
  slackDMId: String
})

const Task = mongoose.model('Task', taskSchema);
const User = mongoose.model('User', userSchema);

module.exports = {
  Task: Task,
  User: User,
};
