const express = require('express');
const router = express.Router({mergeParams:true});

const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');

const catchAsync = require('../utility/catchAsync');
const ExpressError = require('../utility/ExpressError');

const { reviewSchema } = require('../JoiCampgroundSchema');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

// const validateReview = (req,res,next)=>{
//     const {error} = reviewSchema.validate(req.body);
//     // console.log(req.body)
//     // console.log(error)
//     if(error){
//         const msg = error.details.map(el=>el.message).join(',');
//         throw new ExpressError(msg,400);
//     } else{
//         next();
//     }
// }

//creating reviews
router.post('/', validateReview, isLoggedIn, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;