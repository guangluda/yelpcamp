const express = require('express');
const router = express.Router();
const catchAsync = require('../utility/catchAsync');
const ExpressError = require('../utility/ExpressError');
const Campground = require('../models/campground');
const {campgroundSchema} = require('../JoiCampgroundSchema');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const review = require('../models/review');

const multer = require('multer');
const {storage} = require('../cloudinary');
// const upload = multer({dest:'uploads/'});
const upload = multer({storage});


router.get('/', catchAsync(campgrounds.index))
router.get('/new',isLoggedIn, campgrounds.renderNewForm)
//This needs to go before router.get('/campgrounds/:id', async(req,res)=>{
//because route execute in order.
router.post('/', upload.array('image'), validateCampground,  catchAsync(campgrounds.createCampground))
// router.post('/', upload.array('image'), (req,res)=>{
//     //upload.single('image')
//     console.log(req.body);
//     console.log(req.files);
//     res.send('It worked.')
// })
router.get('/:id', catchAsync(campgrounds.showCampground))
// router.get('/:id/edit', isLoggedIn, catchAsync(async (req,res)=>{
//     const {id} = req.params;
//     const campground = await Campground.findById(id);
//     res.render('campgrounds/edit',{campground});
// }))
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))
// router.patch('/:id', isLoggedIn, validateCampground, catchAsync(async(req,res)=>{
//     const {id} = req.params;
//     const campground = await Campground.findByIdAndUpdate(id,req.body,{runValidators:true,new:true});
                                                       //colt:(id,{...req.body}) 
//     // console.log(req.body);
//     req.flash('success','Successfully updated campground.')
//     res.redirect(`/campgrounds/${campground._id}`)
// }))
router.patch('/:id', isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

module.exports = router;
