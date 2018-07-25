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
  googleTokens: {
    type: Object,
    required: true
  },
  googleId: String,
  // defaultSetting: {
  //   meetingLength: 30
  // },
  slackId: {
    type: String,
    required: true
  },
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
