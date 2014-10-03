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
    mealSelection: String,
    extraInfo: String
});

var RSVP = mongoose.model('RSVP', rsvpSchema);


//Setup NodeMailier for contact page. 
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'thedanieljohnson@gmail.com',
        pass: '#)iPL!n,a8zX'
    }
});




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
router.get('/', [ middleware.exposeTemplates(), routes.render('home') ]);

router.get('/directions', [ middleware.exposeTemplates(), routes.render('directions') ]);

router.get('/accomodation', [ middleware.exposeTemplates(), routes.render('accomodation') ]);

router.get('/registry', [ middleware.exposeTemplates(), routes.render('registry') ]);

router.get('/RSVP', [ middleware.exposeTemplates(), routes.render('RSVP') ]);

router.get('/contact', [ middleware.exposeTemplates(), routes.render('contact') ]);

router.post('/RSVP', function(req, res) {
    //Create a new RSVP
    var newRSVP = new RSVP(req.body);
    //Save it to the Database
    newRSVP.save(function (err, newRSVP) {
    
    if (err) {
        return console.error(err);
        res.status(400).send("Failed");
    } 
        
    res.status(200).send(newRSVP);
    console.log('Saved RSVP');
    });
});

router.post('/contact', function(req, res) {
    //Setup the email
    console.log(req.body);
    var mailOptions = {
    from: req.body.email, // sender address
    to: 'dan@ddajohnson.com', // list of receivers
    subject: 'Email From Wedding Website', // Subject line
    text: req.body.message, // plaintext body
    html: req.body.message // html body
    };

    transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
        res.status(400).send('Your email did not send: ' + error);
    }else{
        console.log('Message sent: ' + info.response);
        res.status(200).send('Your email did send! Woohoo!');
    }});
});




// A Route for Creating a 500 Error (Useful to keep around)
router.get('/500', routes.render);

//The 404 Route (ALWAYS Keep this as the last route)
router.get('/*', function(req, res, next){
    next(utils.error(404, 'Page not found'));
});
