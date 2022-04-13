const Campground = require('../models/campground');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken:mapboxToken});

module.exports.index = async(req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}

module.exports.renderNewForm = (req,res)=>{  
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req,res,next)=>{
    const campground = new Campground(req.body);

    const geoData = await geocoder.forwardGeocode({
        query:campground.location,
        limit:1
    }).send()
    // console.log(req.body)
    // console.log(req.files)
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f=>({url:f.path,filename:f.filename}));//storing uploaded image links in mongo
    campground.author = req.user._id;//assocaite campground with user who created it
    await campground.save();
    // console.log(campground)
    req.flash('success','Successfully made a new campground.');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async(req,res)=>{
    const {id} = req.params;
    const campground =await Campground.findById(id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');
    // console.log(campground)
    if(!campground){
        req.flash('error','Cannot find the campground.');
        res.redirect('/campgrounds');//Colt use return here. Why?
    }
    res.render('campgrounds/show',{campground});
}

module.exports.renderEditForm = async (req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error','Cannot find the campground.');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{campground});
}

module.exports.updateCampground = async(req,res)=>{
    // console.log(req.body)
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,req.body,{runValidators:true,new:true});
    const imgs = req.files.map(f=>({url:f.path,filename:f.filename}));
    campground.images.push(...imgs);
    if(req.body.deleteImages){
        await campground.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}});
    }
    //up 3 lines is for deleting images backend.
    await campground.save();
    req.flash('success','Successfully updated campground.')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async(req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully deleted campground.')
    res.redirect('/campgrounds');
}

