//https://medium.com/swlh/jwt-authentication-authorization-in-nodejs-express-mongodb-rest-apis-2019-ad14ec818122

var mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    trim: true
  },

  messages: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Message" 
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: value => {
      if (!validator.isEmail(value)) {
        throw new Error({ error: 'Invalid email address'})
      }
    }
  },

  password: {
    type: String,
    required: true
  },

  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
});

userSchema.pre("save", async function(next) {
  // Hash the password before saving the user model. only hash if modified or new
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});


userSchema.methods.generateAuthToken = async function() {
  // Generate an auth token for the user
  const user = this;
  const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};


// login users to application.  If the email exists, we then compare the received password with the stored hashed password and if they match, we return that user. 
userSchema.statics.findByCredentials = async (email, password) => {
  // Search for a user by email and password.
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error({ error: "Invalid login credentials" });
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new Error({ error: "Invalid login credentials" });
  }
  return user;
};


// if user is deleted, pre hook to our user schema to remove all messages of this user
userSchema.pre("remove", function(next) {
  this.model("Message").deleteMany({ user: this._id }, next);
});


const User = mongoose.model("User", userSchema);

module.exports = User;
