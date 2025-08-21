const mongoose = require('mongoose');
const passport = require('passport');

const plm = require('passport-local-mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/pin');

const userSchema = mongoose.Schema({
  username:{
    type: String,
    // required: true,
  },
  fullname: {
    type: String,
    // required: true
  },
  email:{
    type: String,
    // unique: true
  },
  password:{
    type: String,
  },
  profileImage:{
    type: String,
  },
  boards:{
    type: Array,
    default: []
  },
  posts:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "post"
  }]
})

userSchema.plugin(plm, {
  usernameField: 'username', // if you're using email
});
module.exports = mongoose.model('user', userSchema); 