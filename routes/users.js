const express = require('express');
const router = express.Router();
const User = require('../models/user');
const users = require('../controllers/users');
const passport = require('passport'); 

const catchAsync = require('../utility/catchAsync');



router.get('/register', users.renderRegister);
router.post('/register', catchAsync(users.register));
router.get('/login', users.renderLogin);
// router.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),(req,res)=>{
//     req.flash('success','Welcome back.')
//     res.redirect('/campgrounds')
// })
router.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),users.login)
router.get('/logout', users.logout)

module.exports = router;

//MongoServerError: E11000 duplicate key error collection: 
//yelp-camp.users index: password_1 dup key: { password: null }

// The reason behind this error is that. The index is not present in your 
// collection, in which you are trying insert. So Solution is to drop that 
// collection and run your program again.

// Drop collection from DB and try again! Cheers

//The error message is saying that there is already a record with null as the email. If a document does not have a value for the indexed field in a unique index, the index will save a null value for this document. Because of the unique feature, MongoDB will only permit one document that lacks the indexed field. So just remove that null document and it will work.