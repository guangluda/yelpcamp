const Campground = require('./models/campground');
const Review = require('./models/review');
const {campgroundSchema,reviewSchema} = require('./JoiCampgroundSchema');
const ExpressError = require('./utility/ExpressError');

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        //store where user initially requesting when we trying to log them in.
        //2 options:req.path,this is not working because router path prefixed in app.js
        //req.originalUrl,
        req.flash('error','You must be signed in.')
        return res.redirect('/login')
    }
    next()
}

module.exports.validateCampground = (req,res,next)=>{
    // const result = campgroundSchema.validate(req.body);
    // console.log(result);
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg,400);
    } else{
        next();
    }
}

module.exports.isAuthor = async (req,res,next) => {
    const {id} =req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error','You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
};

module.exports.isReviewAuthor = async (req,res,next) => {
    const {id,reviewId} =req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error','You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
};

module.exports.validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    // console.log(req.body)
    // console.log(error)
    if(error){
        const msg = error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg,400);
    } else{
        next();
    }
}
