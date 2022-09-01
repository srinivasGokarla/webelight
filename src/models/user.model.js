const { rejects } = require("assert");
const bcrypt = require("bcryptjs");
const { Schema, model} = require("mongoose");
const { resolve } = require("path/posix");
const userSchema = new Schema({
  fullName: {
    type: String,
    required: [true, "fullname not provided "],
  },
  email: {
    type: String,
    unique: [true, "email already exists in database!"],
    lowercase: true,
    trim: true,
    required: [true, "email not provided"],
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: '{VALUE} is not a valid email!'
    }

  },
  role: {
    type: String,
    enum: ["normal", "admin"],
    required: [true, "Please specify user role"]
  },
  password: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
  
});

userSchema.pre("save", function (next) {  //create and update
if(!this.isModified("password")) return next();
bcrypt.hash(this.password, 10, (err,hash) => {
  this.password = hash;
  return next();
});
     
  });

  userSchema.methods.checkPassword = function (password) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password,this.password, function(err,same) {
        if(err) return reject(err);

        return resolve(same);
    })
    

      
    })
  }


module.exports = model("user", userSchema); // users
