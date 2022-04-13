const mongoose = require('mongoose');
const cities = require('./cities');
const {descriptors, places} = require('./seedHelpers');
const Campground = require('../models/campground'); //require model

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console,'connection error'));
db.once('open',()=>{
    console.log('Database connected!')
});

const sample = array => array[Math.floor(Math.random()*array.length)];
const seedDB = async () =>{
    await Campground.deleteMany({});
    for(let i=0; i<300; i++){
        const random1000 = Math.floor(Math.random()*1000);
    const camp = new Campground({
        author:'622d5921d1e96fccc9bfd62d',//associated with user model
        location: `${cities[random1000].city},${cities[random1000].state}`,
        title:`${sample(descriptors)} ${sample(places)}`,
        // image:'https://source.unsplash.com/collection/483251',
        geometry:{ 
          type: 'Point', 
          coordinates: [ 
            cities[random1000].longitude,
            cities[random1000].latitude
           ] 
        },
        images: [
            {
              url: 'https://res.cloudinary.com/do2m8d7kl/image/upload/v1648472078/YelpCamp/f5ua6udxzoq4fk0cjkxq.jpg',
              filename: 'YelpCamp/f5ua6udxzoq4fk0cjkxq'
            },
            {
              url: 'https://res.cloudinary.com/do2m8d7kl/image/upload/v1648472078/YelpCamp/oysgvxf57y1ljviyt3uu.jpg',
              filename: 'YelpCamp/oysgvxf57y1ljviyt3uu'
            },
            {
              url: 'https://res.cloudinary.com/do2m8d7kl/image/upload/v1648472078/YelpCamp/lkmhys3tmfzcvgxappwl.jpg',
              filename: 'YelpCamp/lkmhys3tmfzcvgxappwl'
            }
          ],
        price:20,
        description:'AFALFSJALSFSADJFLASJFLASJFLA'
    });
    await camp.save();
    }        
}
seedDB().then(()=>{
    mongoose.connection.close() //never saw this before!
});