const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newschema = new Schema({
  username: {
    type: String,
    require: true
  },
  password: {
    type: String,
    require: true
  },
  following: {
    type: Array,
    require: false
  },
  followers: {
    type: Array,
    require: false
  }

});

const postSchema = new Schema({
  author: {
    type: String,
    required:true
  },
  topic: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  filter: {
    type: String,
    required: true
  },
  authorID: {
    type: String,
    required: true
  }
},{timestamps:true});


const NewSchema = mongoose.model('users', newschema);
const PostSchema = mongoose.model('posts', postSchema);

module.exports = {NewSchema, PostSchema};