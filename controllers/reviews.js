const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async(req,res)=>{
    const {id} = req.params;
    const {rating, body} = req.body;
    const campground = await Campground.findById(id);//or just req.params.id
    const review = new Review({rating,body});//or just req.body.review
    review.author = req.user._id; // associate with user
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    // console.log(review)
    // console.log(campground)
    req.flash('success','Successfully created review.')
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async(req,res)=>{
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully deleted review.')
    res.redirect(`/campgrounds/${id}`)
}