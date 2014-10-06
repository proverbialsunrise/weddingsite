/*Copyright 2014 Yahoo! Inc. All rights reserved.*/
var STATUS_CODES = require('http');

var fs      = require('fs'),
    path    = require('path'),
    Promise = require('ypromise');

exports.error      = error;
exports.requireDir = requireDir;
exports.extend     = extend;
exports.promisify  = promisify;
exports.imagesFromInterval = imagesFromInterval;
exports.allImagesFromInterval = allImagesFromInterval;

// -----------------------------------------------------------------------------

function error(statusCode, message) {
    var err;

    if (message instanceof Error) {
        err = message;
    } else {
        err = new Error(message || STATUS_CODES[statusCode]);
    }

    err.status = statusCode;
    return err;
}

function requireDir(dir) {
    return fs.readdirSync(dir).reduce(function (modules, filename) {
        if (filename === 'index.js' || path.extname(filename) !== '.js') {
            return modules;
        }

        var moduleName = path.basename(filename, '.js'),
            module     = require(path.join(dir, moduleName));

        if (typeof module === 'function' && module.name) {
            moduleName = module.name;
        }

        modules[moduleName] = module;
        return modules;
    }, {});
}

function extend(obj) {
    Array.prototype.slice.call(arguments, 1).forEach(function (source) {
        if (!source) { return; }

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                obj[key] = source[key];
            }
        }
    });

    return obj;
}

function promisify(fn) {
    return function () {
        var args = Array.prototype.slice.call(arguments);
        return new Promise(function (resolve, reject) {
            args.push(function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
            fn.apply(null, args);
        });
    }
}

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function imagesFromInterval(min,max,number)
{
    var ints = [];
    var paths = [];
    var images = [];
    while(ints.length < number){
        //Generate a random number
        var randomnumber=randomIntFromInterval(min,max)
        //Make sure it's not already in the array.
        var inArray=false;
        for(var i=0;i<ints.length;i++){
            if(ints[i]==randomnumber){inArray=true;break}
        }
        if(!inArray){
            ints[ints.length]=randomnumber;
            var image = {};
            image.path = "/img/" +randomnumber.toFixed(0) + ".jpg";
            image.alt = randomnumber.toFixed(0);
            images[images.length] = image;
        }
    }
    return images;
}

function allImagesFromInterval(min,max)
{
    var images = [];
    for (var i = min; i <= max; i++)
    {
        var image = {};
        image.path = "/img/" + i.toFixed(0) + ".jpg";
        image.alt = i.toFixed(0);
        images[images.length]=image;
    }
    return images;
}
