require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const User = require("./Model/user");
const bcrypt = require("bcrypt");
const app = express();
const jwt=require("jsonwebtoken")

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.post("/signup", (req, res) => {
  const { email, password } = req.body;

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({
        error: err,
      });
    } else {
      const user = new User({
        email: email,
        password: hash,
      });
      user
        .save()
        .then((result) => {
          res.status(201).json({
            message: "Sucessfully Created",
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({
            error: err,
          });
        });
    }
  });
});
app.post("/login",(req,res,next)=>{
    User.find({email:req.body.email})
    .exec()
    .then(user=>{
        if(user.length<1){
            return res.status(401).json({msg:"User Not Find"})
        }
        bcrypt.compare(req.body.password,user[0].password,(err,response)=>{
            if(!response){
                return res.status(401).json({msg:"wrong password"})
            }
            if(response){
                const token=jwt.sign({
                    email:user[0].email
                },
                "verify",{
                    expiresIn:"7d"
                });
                res.status(200).json({
                    email:user[0].email,
                    token:token
                })
            }
        })
    }).catch(err=>{
        res.status(500).json({
            msg:"error"
        })
    })
})



mongoose.connect(process.env.db_url).then(() => {
  app.listen(8080, () => {
    console.log("server statrted on port 8080");
  });
});