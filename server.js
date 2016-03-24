// set up ========================
var express = require('express');
var app = express(); // create our app w/ express
var mongoose = require('mongoose'); // mongoose for mongodb
var morgan = require('morgan'); // log requests to the console (express4)
var bodyParser = require('body-parser'); // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

// configuration =================

mongoose.connect('mongodb://localhost:27017/amazon'); // connect to mongoDB database on modulus.io


// define model =================
var Article = mongoose.model('Article', {
    titre: String,
    asin: String,
    pays: String,
    categorie: String,
    prix: Number,
    indice: Number,
    img: String,
    lastUpdate: Date,
    version: Number
});

app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({
    'extended': 'true'
})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
})); // parse application/vnd.api+json as json
app.use(methodOverride());

// listen (start app with node server.js) ======================================
app.listen(8080, "0.0.0.0");
console.log("App listening on port 8080");



// routes ======================================================================



// api ---------------------------------------------------------------------
// get all articles
app.get('/api/articles', function (req, res) {

    // use mongoose to get all articles in the database
    Article.find().where('version').lte(1).where('indice').gt(1).lt(55).where('prix').gt(1).where("lastUpdate").ne(null).sort('-lastUpdate').limit(100).exec(function (err, articles) {
        console.log("--------------" + articles.length);
        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)

        res.json(articles); // return all articles in JSON format
    })
});




// create article and send back all articles after creation
app.post('/api/articles', function (req, res) {

    console.log(req.body);
    // use mongoose to get all articles in the database
    // Article.find().where('indice').gt(1).lt(55).where('prix').gt(1).where("lastUpdate").ne(null).sort('-lastUpdate').exec(function (err, articles) 





    var searchReq = Article.find();
    if (req.body.prixMax)
        searchReq = searchReq.where('prix').lte(req.body.prixMax);
    if (req.body.prixMin)
        searchReq = searchReq.where('prix').gte(req.body.prixMin);
    if (req.body.indiceMax)
        searchReq = searchReq.where('indice').lte(req.body.indiceMax);
    if (req.body.indiceMin)
        searchReq = searchReq.where('indice').gte(req.body.indiceMin);
    if (req.body.versionMax)
        searchReq = searchReq.where('version').lte(req.body.versionMax);
    if (req.body.versionMin)
        searchReq = searchReq.where('version').gte(req.body.versionMin);
    if (req.body.lastUpdateMax)
        searchReq = searchReq.where('lastUpdate').lte(req.body.lastUpdateMax);
    if (req.body.lastUpdateMin)
        searchReq = searchReq.where('lastUpdate').gte(req.body.lastUpdateMin);

    var limit = req.body.limit ? req.body.limit : 100;
    searchReq = searchReq.limit(limit);
    console.log(searchReq);
    searchReq.where("lastUpdate").ne(null).sort('-lastUpdate').exec(function (err, articles) {
        console.log("--------------" + articles.length);
        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)

        res.json(articles); // return all articles in JSON format
    })

});

// delete a article
app.delete('/api/articles/:article_id', function (req, res) {
    Article.remove({
        _id: req.params.article_id
    }, function (err, article) {
        if (err)
            res.send(err);

        // get and return all the articles after you create another
        Article.find(function (err, articles) {
            if (err)
                res.send(err)
            res.json(articles);
        });
    });
});

// application -------------------------------------------------------------
app.get('*', function (req, res) {
    res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});