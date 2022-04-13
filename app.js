if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const engine = require('ejs-mate');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const ExpressError = require('./utility/ExpressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

// const dbUrl = process.env.DB_URL;
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
// mongoose.connect(dbUrl);
mongoose.connect(dbUrl);
// mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console,'connection error'));
db.once('open',()=>{
    console.log('Database connected!')
}); 

app.engine('ejs',engine);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(express.urlencoded({extended:true}));
//When we have post requests, and we want information from the post reqest body,
//We dont have access to that body immediately(It's undefined).
//We need to tell Express to use that middleware!!!
app.use(methodOverride('_method'));
app.use(express.static('public'));//to use public directory, serving static assets.

const secret = process.env.SECRET || 'notagoodone';

const store = MongoStore.create({
    mongoUrl:dbUrl,
    // secret:'notagoodone',
    secret,
    touchAfter:24*60*60 //this is for unnecessary save when data not changed
});
store.on('error', function(e){
    console.log('Session store error',e)
});

const sessionConfig = {
    store, //or store:store,
    name:'blah',
    // secret:'notagoodone',
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        // SameSite:false,
        HttpOnly:true,
        // secure:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
//cookie seems not working, and i dont know why
app.use(session(sessionConfig));
app.use(flash());

app.use(helmet());

const scriptSrcUrls = [
    "https://api.mapbox.com/mapbox-gl-js/v2.7.0/mapbox-gl.css",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://api.mapbox.com/mapbox-gl-js/v2.7.0/mapbox-gl.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css",
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/mapbox-gl-js/v2.7.0/mapbox-gl.css",
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/do2m8d7kl/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin"}));




app.use(passport.initialize());
app.use(passport.session());
//make sure to use session() before passport.session()

passport.use(new LocalStrategy(User.authenticate()));
//We can have multiple strategies.

passport.serializeUser(User.serializeUser()); //serialize users into the session
passport.deserializeUser(User.deserializeUser()); //deserialize users into the session


app.use((req,res,next)=>{
    // console.log(req.params)
    // console.log(req.query)
    // console.log(req.session)
    // console.log(req.session.returnTo)
    res.locals.currentUser = req.user;//req.user is by passport
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// app.get('/fakeUser', async(req,res)=>{
//     const user = new User({email:'bx33@gmail.com',username:'bx33'});
//     const newUser = await User.register(user,'whatafs');
//     res.send(newUser);
// })
 
app.use('/',userRoutes);
app.use('/campgrounds',campgroundRoutes);
// prefixed path:/campgrounds,so need to update campgrounds.js routes path.
//delete /campgrounds every path.
app.use('/campgrounds/:id/reviews',reviewRoutes);
//since using this path, campground id will not be available on req.params 
// that's for merge params:const router = express.Router({mergeParams:true});
//need to specify 

app.get('/',(req,res)=>{
    res.render('home')
})


app.all('*', (req,res,next)=>{
    // res.send('404!!!!')
    next(new ExpressError('Page Not Found!!!', 404));
})

app.use((err,req,res,next)=>{
    // res.send('Something went wrong!!!')
    // const {statusCode=500, message='Something went wrong!!!'} = err;
    const {statusCode=500} = err;
    if(!err.message){
        err.message = 'OH NO! Something went wrong!!!'
    }
    // res.status(statusCode).send(message);
    res.status(statusCode).render('error',{err});
})


app.listen(3000, ()=>{
    console.log('Listening on port 3000!!!!')
})