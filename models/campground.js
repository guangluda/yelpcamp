const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;


const ImageSchema = new Schema({
    url:String,
    filename:String
})

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200');
})
//virtual storage ?? get img.thumbnail in edit.ejs

const opts = {toJSON:{virtuals:true}};//for including virtual

const CampgroundSchema = new Schema({
    title:String,
    price:Number,
    description:String,
    location:String,
    images:[ImageSchema],
    geometry:{    
    // from mongoose location or geojson
        type:{
            type:String,   
            //Dont do {geometry:{type:String}}
            enum:['Point'],   
            //geometry.type must be 'Point'
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
},opts);
CampgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0,20)}</p>`
})



// CampgroundSchema.pre('findOneAndDelete', async function(doc){

//     console.log('PRE')
//     console.log(doc)

// })
CampgroundSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        await Review.deleteMany({_id:{$in:doc.reviews}})
    }
    // console.log('Post')
    // console.log(doc)
})

module.exports = mongoose.model('Campground', CampgroundSchema);