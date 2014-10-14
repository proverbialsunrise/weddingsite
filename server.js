//setup Dependencies
var express  = require('express'),
bodyParser   = require('body-parser'),
cookieParser = require('cookie-parser'),
session      = require('express-session'),
state        = require('express-state'),
hbs          = require('./lib/exphbs'),
routes       = require('./routes'),
middleware   = require('./middleware'),
config       = require('./config'),
utils        = require('./lib/utils'),
app          = express(),
port         = (process.env.PORT || 8000),
server       = app.listen(port, function () {
    console.log("Bedrock Server listening on port " + server.address().port);
}),
router;

//Setup Database Connection and Required Schemas.
var mongoose = require('mongoose');

mongoose.connect('mongodb://weddingwebsite:Sonwhitil3n@ds045087.mongolab.com:45087/danalina')

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('Opened Database Connection');
});

var rsvpSchema = mongoose.Schema({
    name: String,
    email: String,
    attendance: String,
    mealSelection: String,
    extraInfo: String
});

var RSVP = mongoose.model('RSVP', rsvpSchema);

//Setup postmark to send email.  
var postmark = require("postmark")("dd9d8d71-3f57-47ae-a580-8ab2b5a6b8c8");

//Setup Express App
state.extend(app);
app.engine(hbs.extname, hbs.engine);
app.set('view engine', hbs.extname);
app.enable('view cache');

//Uncomment this if you want strict routing (ie: /foo will not resolve to /foo/)
//app.enable('strict routing');

//Change "App" to whatever your application's name is, or leave it like this.
app.set('state namespace', 'dalina');

//Create an empty Data object and expose it to the client. This
//will be available on the client under App.Data.
//This is just an example, so feel free to remove this.
app.expose({}, 'imagePaths');

if (app.get('env') === 'development') {
    app.use(middleware.logger('tiny'));
}

// Set default views directory. 
app.set('views', config.dirs.views);

router = express.Router({
    caseSensitive: app.get('case sensitive routing'),
    strict       : app.get('strict routing')
});

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// Parse application/json
app.use(bodyParser.json())

// Parse cookies.
app.use(cookieParser());

// Session Handling
app.use(session({secret: 'keyboard cat', resave: true, saveUninitialized: true}));

// Specify the public directory.
app.use(express.static(config.dirs.pub));

// Uncomment this line if you are using Bower, and have a bower_components directory.
// Before uncommenting this line, go into config/index.js and add config.dirs.bower there.
//app.use(express.static(config.dirs.bower));

// Error handling middleware
app.use(function(err, req, res, next) {
    if(!err) return next();
    console.log(err);
    if (err.status && err.status === 404) {
        res.render('404', {error: err});
    }
    else {
        res.render('500', {error: err});
    }
});

app.use(function(req, res, next) {
    res.locals.images = utils.imagesFromInterval(1,37,4);
    next();
});


// Use the router.
app.use(router);


///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////
//A function to add 4 random image paths to each thing to render.

// The exposeTemplates() method makes the Handlebars templates that are inside /shared/templates/
// available to the client.
router.get('/', function (req, res) {
    res.locals.title = "Dan & Alina";
    res.render('home') 
});

router.get('/directions', function (req, res) {
    res.locals.title = "Dan & Alina | Directions";
    res.render('directions') 
});

router.get('/accomodation', function (req, res) {
    res.locals.title = "Dan & Alina | Accomodation";
    res.render('accomodation') 
});

router.get('/registry', function (req, res) {
    res.locals.title = "Dan & Alina | Registry";
    res.render('registry') 
});

router.get('/RSVP', function (req, res) {
    res.locals.title = "Dan & Alina | RSVP";
    res.render('RSVP') 
});

router.get('/contact', function (req, res) {
    res.locals.title = "Dan & Alina | Contact";
    res.render('contact');
});

router.get('/saskatchewan', function (req, res) {
    res.locals.title = "Dan & Alina | Saskatchewan Celebration";
    res.render('saskatchewan');
});

router.get('/photos', function (req, res) {
    allphotos = utils.allImagesFromInterval(1,37);
    res.locals.allphotos = allphotos;
    res.locals.title = "Dan & Alina | Photos";
    res.render('photos'); 
});
    
router.get('/guests', function (req, res) {
    middleware.exposeTemplates();
    RSVP.find(function (err, guests) {
        if (err) return console.error(err);
        res.locals.guests = guests;
        res.locals.title = "Dan + Alina | Guests";
        res.render('guests');
        console.log(guests);
    });
});


router.post('/RSVP', function(req, res) {
    //Create a new RSVP
    var newRSVP = new RSVP(req.body);
    //Save it to the Database
    newRSVP.save(function (err, newRSVP) {
        if (err) {
            res.status(400).send("Failed");
            return console.error(err);
        } 
        res.status(200).send(newRSVP);
        console.log('Saved RSVP');
    });
});

router.post('/contact', function(req, res) {
    //Setup the email
    console.log(req.body);


    postmark.send({
        "From": "\"" + req.body.name + "\"" + "dan@ddajohnson.com",
        "To": "dan@ddajohnson.com, alinabp@gmail.com", 
        "Subject": "Contact Request from Wedding Site: " + req.body.name,
        "TextBody": req.body.message,
        "ReplyTo": req.body.email
    }, function(error, success) {
        if(error) {
            console.error("Unable to send via postmark: " + error.message);
            res.status(400).send(error.message);
        }
        res.status(200).send();
        console.info("Sent to postmark for delivery")
    });
});




// A Route for Creating a 500 Error (Useful to keep around)
router.get('/500', routes.render);

//The 404 Route (ALWAYS Keep this as the last route)
router.get('/*', function(req, res, next){
    next(utils.error(404, 'Page not found'));
});
