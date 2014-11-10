#Wedding Website

The code for my wedding website built using [Bedrock](http://tilomitra.github.io/bedrock) and NodeJS.  Uses [PureCSS](http://purecss.io/) as a CSS framework.  The completed site can be found at [wedding.danandalina.com](http://wedding.danandalina.com).

Hosts easily on Heroku.


You'll need a config/index.js file that looks something like this:

```
//Store your API Keys and stuff here.
'use strict';

var path = require('path');
var mongoose = require('mongoose');

//Setup Database Connection and Required Schemas.
mongoose.connect(#MONGOCONNECTIONSTRING#)


//Setup postmark to send email.  
var postmark = require("postmark")(#POSTMARKAPIKEY#);


module.exports = {
    dirs: {
        pub     : path.resolve('public/'),
        bower   : path.resolve('bower_components/'),
        views   : path.resolve('views/'),
        layouts : path.resolve('views/layouts/'),
        partials: path.resolve('views/partials/'),
        shared  : path.resolve('shared/templates/')
    },
    mongoose: mongoose,
    postmark: postmark
};
```
