var uuidv4 = require('uuid/v4');
var express = require("express");
var router = express.Router();
var userModel = require("../models/user");
var messageModel = require("../models/message");
const auth = require("../middleware/auth");


//get all messages
router.get("/", async (req, res) => {
  const authHeader = req.get("Authorization");
  const user = req.user;
  console.log(authHeader);
  console.log(user);
  const messages = await messageModel.find({}).populate('user');
  return res.send(messages);
});


//get particular messages
router.get("/:messageId", async (req, res) => {
  const message = await messageModel.findById(req.params.messageId).populate('user');
  return res.send(message);
});



//  There are shorter ways to accomplish the remove of a message in the database with Mongoose. 
//  This makes sure to trigger the database hooks which can be set up in the models. remove() hook in the src/models/user.js file 
router.delete("/:messageId", async (req, res) => {
  const message = await req.context.messageModel.findById(req.params.messageId);
  let result = null;
  if (message) {
    result = await message.remove();
  }
  return res.send(result);
});

module.exports = router;

/*
// create new message, creating a unique id for that maessage,
router.post("/", async (req, res) => {
  const tempUser = await userModel.findByLogin("ryan");
  const message = await messageModel.create({
    text: req.body.text,
    user: tempUser.id
  });
  return res.send({ message, tempUser});
});
*/