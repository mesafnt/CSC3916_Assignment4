// var express = require('express');
// var bodyParser = require('body-parser');
// var passport = require('passport');
// var authController = require('./auth');
// require('dotenv').config({ path: './.env' });
// var authJwtController = require('./auth_jwt');
// var jwt = require('jsonwebtoken');
// var cors = require('cors');
// var User = require('./Users');
// var Movie = require('./Movies');
// var Review = require('./Reviews');
// var mongoose = require('mongoose');
// var rp = require('request-promise');
// const crypto = require("crypto");

// var app = express();
// app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

// app.use(passport.initialize());

// var router = express.Router();

// const GA_TRACKING_ID = process.env.GA_KEY;

// function trackDimension(category, action, label, value, dimension, metric) {

//     var options = { method: 'GET',
//         url: 'https://www.google-analytics.com/collect',
//         qs:
//             {   // API Version.
//                 v: '1',
//                 // Tracking ID / Property ID.
//                 tid: GA_TRACKING_ID,
//                 // Random Client Identifier. Ideally, this should be a UUID that
//                 // is associated with particular user, device, or browser instance.
//                 cid: crypto.randomBytes(16).toString("hex"),
//                 // Event hit type.
//                 t: 'event',
//                 // Event category.
//                 ec: category,
//                 // Event action.
//                 ea: action,
//                 // Event label.
//                 el: label,
//                 // Event value.
//                 ev: value,
//                 // Custom Dimension
//                 cd1: dimension,
//                 // Custom Metric
//                 cm1: metric
//             },
//         headers:
//             {  'Cache-Control': 'no-cache' } };

//     return rp(options);
// }

// function getJSONObjectForMovieRequirement(req) {
//     var json = {
//         headers: "No headers",
//         key: process.env.UNIQUE_KEY,
//         body: "No body"
//     };

//     if (req.body != null) {
//         json.body = req.body;
//     }

//     if (req.headers != null) {
//         json.headers = req.headers;
//     }

//     return json;
// }

// router.post('/signup', function (req, res) {
//     if (!req.body.username || !req.body.password) {
//         res.json({ success: false, msg: 'Please include both username and password to signup.' })
//     } else {

//         var user = new User();
//         user.name = req.body.name;
//         user.username = req.body.username;
//         user.password = req.body.password;

//         user.save(function (err) {
//             if (err) {
//                 if (err.code === 11000) {
//                     return res.json({success: false, message: 'A user with that username already exists'});
//                 } else {
//                     return res.json(err);
//                 }
//             }
//             res.json({ success: true, msg: 'Successfully created new user.' });
//         });
//     }
// });

// router.post('/signin', function (req, res) {

//     var userNew = new User();
//     userNew.username = req.body.username;
//     userNew.password = req.body.password;

//     User.findOne({ username: userNew.username }).select('name username password').exec(function (err, user) {
//         if (err) {
//             res.send(err);
//         }

//         user.comparePassword(userNew.password, function (isMatch) {
//             if (isMatch) {
//                 var userToken = { id: user.id, username: user.username };
//                 var token = jwt.sign(userToken, process.env.SECRET_KEY);
//                 res.json({ success: true, token: 'JWT ' + token });
//             }
//             else {
//                 res.status(401).send({ success: false, msg: 'Authentication failed.' });
//             }
//         })
//     })
// });

// router.route('/movies/:movie_title')
//     .get(authJwtController.isAuthenticated, function (req, res) {
//         if (req.query && req.query.reviews && req.query.reviews === "true") {

//             Movie.findOne({title: req.params.movie_title}, function(err, movie) {
//                 if (err) {
//                     return res.status(403).json({success: false, message: "Unable to get reviews for title passed in"});
//                 } else if (!movie) {
//                     return res.status(403).json({success: false, message: "Unable to find title passed in."});
//                 } else {

//                     Movie.aggregate()
//                         .match({_id: mongoose.Types.ObjectId(movie._id)})
//                         .lookup({from: 'reviews', localField: '_id', foreignField: 'movie_id', as: 'reviews'})
//                         .addFields({averaged_rating: {$avg: "$reviews.rating"}})
//                         .exec (function(err, mov) {
//                             if (err) {
//                                 return res.status(403).json({success: false, message: "The movie title parameter was not found."});
//                             } else {
//                                 return res.status(200).json({success: true, message: "Movie title passed in and it's reviews were found.", movie: mov});
//                             }

//                         })
//                 }
//             })
//         } else {
//             Movie.find({title: req.params.movie_title}).select("title year_released genre actors").exec(function (err, movie) {
//                 if (err) {
//                     return res.status(403).json({success: false, message: "Unable to retrieve title passed in."});
//                 }
//                 if (movie && movie.length > 0) {
//                     return res.status(200).json({
//                         success: true,
//                         message: "Successfully retrieved movie.",
//                         movie: movie
//                     });
//                 } else {
//                     return res.status(404).json({
//                         success: false,
//                         message: "Unable to retrieve a match for title passed in."
//                     });
//                 }

//             })
//         }
//     });

// router.route('/search/:key_word')
//     .get(authJwtController.isAuthenticated, function (req, res) {

//         var searchKey = new RegExp(req.params.key_word, 'i')
//         Movie.find({title: searchKey}, function(err, docs) {
//             if (err) {
//                 return res.status(403).json({success: false, message: "Unable to retrieve title passed in."});
//             }
//             if (docs && docs.length > 0) {
//                 return res.status(200).json({
//                     success: true,
//                     message: "Successfully retrieved movie.",
//                     movie: docs
//                 });
//             } else {
//                 return res.status(404).json({
//                     success: false,
//                     message: "Unable to retrieve a match for title passed in."
//                 });
//             }
//         })
//     });

// router.route('/movies')
//     .post(authJwtController.isAuthenticated, function (req, res) {
//         if (!req.body.title || !req.body.year_released || !req.body.genre || !req.body.actors[0] || !req.body.actors[1] || !req.body.actors[2]) {
//             return res.json({ success: false, message: 'Please include all information for title, year released, genre, and 3 actors.'});
//         } else {
//             var movie = new Movie();

//             movie.title = req.body.title;
//             movie.year_released = req.body.year_released;
//             movie.genre = req.body.genre;
//             movie.actors = req.body.actors;

//             movie.save(function (err) {
//                 if (err) {
//                     if (err.code === 11000) {
//                         return res.json({ success: false, message: "That movie already exists."});
//                     } else {
//                         return res.send(err);
//                     }
//                 } else {
//                     return res.status(200).send({success: true, message: "Successfully created movie."});
//                 }
//             });
//         }
//     })
//     .put(authJwtController.isAuthenticated, function (req, res) {
//         if (!req.body.find_title || !req.body.update_title) {
//             return res.json({ success: false, message: "Please provide a title to be updated as well as the new updated title."});
//         } else {
//             Movie.findOneAndUpdate( req.body.find_title, req.body.update_title, function (err, movie) {
//                 if (err) {
//                     return res.status(403).json({success: false, message: "Unable to update title passed in."});
//                 } else if (!movie) {
//                     return res.status(403).json({success: false, message: "Unable to find title to update."});
//                 } else {
//                     return res.status(200).json({success: true, message: "Successfully updated title."});
//                 }
//             });
//         }
//     })
//     .delete(authJwtController.isAuthenticated, function (req, res) {
//         if (!req.body.find_title) {
//             return res.json({ success: false, message: "Please provide a title to delete." });
//         } else {
//             Movie.findOneAndDelete( req.body.find_title, function (err, movie) {
//                 if (err) {
//                     return res.status(403).json({success: false, message: "Unable to delete title passed in."});
//                 } else if (!movie) {
//                     return res.status(403).json({success: false, message: "Unable to find title to delete."});
//                 } else {
//                     return res.status(200).json({success: true, message: "Successfully deleted title."});
//                 }
//             });
//         }
//     })
//     .get(authJwtController.isAuthenticated, function (req, res) {

//         if (req.query && req.query.reviews && req.query.reviews === "true") {

//             Movie.find(function (err, movies) {
//                 if (err) {
//                     return res.status(403).json({success: false, message: "Unable to get reviews for titles"});
//                 } else if (!movies) {
//                     return res.status(403).json({success: false, message: "Unable to find titles"});
//                 } else {

//                     Movie.aggregate()
//                         // .match({_id: mongoose.Types.ObjectId(movie._id)})
//                         .lookup({from: 'reviews', localField: '_id', foreignField: 'movie_id', as: 'reviews'})
//                         .addFields({averaged_rating: {$avg: "$reviews.rating"}})
//                         .exec(function (err, mov) {
//                             if (err) {
//                                 return res.status(403).json({
//                                     success: false,
//                                     message: "The movie title parameter was not found."
//                                 });
//                             } else {
//                                 mov.sort((a,b) => { return b.averaged_rating - a.averaged_rating; });
//                                 return res.status(200).json({
//                                     success: true,
//                                     message: "Movie title passed in and it's reviews were found.",
//                                     movie: mov
//                                 });
//                             }
//                         })
//                 }
//             })
//         }

//         else {
          
//             Movie.find(function(err, movies) {
//                 if (err) res.send(err);

//                 res.json(movies).status(200).end();
//             })
//         }
//     })
//     .all(function(req, res) {
//         return res.status(403).json({success: false, message: "This HTTP method is not supported. Only GET, POST, PUT, and DELETE are supported."});
//     });

// router.route('/reviews')
//     .post(authJwtController.isAuthenticated, function(req, res) {
//         if (!req.body.review || !req.body.rating || !req.body.title)
//         {
//             return res.json({ success: false, message: 'Please include all information for small review, rating, and title to query.'});
//         }
//         else {
//             var review = new Review();

//             // retrieve authorization from authorization header and remove first 4 characters to get just the token
//             jwt.verify(req.headers.authorization.substring(4), process.env.SECRET_KEY, function(err, ver_res) {
//                 if (err)
//                 {
//                     return res.status(403).json({success: false, message: "Unable to post review passed in."});
//                 } else {
//                     review.user_id = ver_res.id;

//                     Movie.findOne({title: req.body.title}, function(err, movie) {
//                         if (err) {
//                             return res.status(403).json({success: false, message: "Unable to post review for title passed in"});
//                         } else if (!movie) {
//                             return res.status(403).json({success: false, message: "Unable to find title to post review for."});
//                         } else {
//                             review.movie_id = movie._id;
//                             review.username = ver_res.username;
//                             review.review = req.body.review;
//                             review.rating = req.body.rating;

//                             review.save (function (err) {
//                                 if (err) {
//                                     return res.status(403).json({success: false, message: "Unable to post review for title passed in."});
//                                 } else {
//                                     trackDimension(movie.genre, 'post/review', 'POST', review.rating, movie.title, '1');

//                                     return res.status(200).json({success: true, message: "Successfully posted review for title passed in.", movie: movie});
//                                 }
//                             })
//                         }
//                     })
//                 }
//             })
//         }
//     })
//     .all (function (req, res) {
//         return res.status(403).json({success: false, message: "This HTTP method is not supported. Only POST is supported."});
//     });

// router.all('/', function (req, res) {
//     return res.status(403).json({ success: false, msg: 'This route is not supported.' });
// });

// router.route('/test')
//     .get(function (req, res) {
//         // Event value must be numeric.
//         trackDimension('Feedback', 'Rating', 'Feedback for Movie', '3', 'Guardian\'s of the Galaxy 2', '1')
//             .then(function (response) {
//                 console.log(response.body);
//                 res.status(200).send('Event tracked.').end();
//             })
//     });

// app.use('/', router);
// app.listen(process.env.PORT || 8080);
// module.exports = app; // for testing only
var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');
var Review = require('./Reviews');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});

router.route('/movies')
    .post(authJwtController.isAuthenticated, function (req, res) {
        if(req.body.actors.length < 3){
            res.status(400).json({message: "Need at least 3 actors"});
        }else {
            Movie.find({title: req.body.title}, function (err, data) {
                if (err) {
                    res.status(400).json({message: "Invalid query"});
                } else if (data.length == 0) {
                    let mov = new Movie({
                        title: req.body.title,
                        year_released: req.body.year_released,
                        genre: req.body.genre,
                        actors: req.body.actors,
                        ImageUrl: req.body.ImageUrl
                    });

                    console.log(req.body);


                    mov.save(function (err) {
                        if (err) {
                            res.json({message: err});
                        } else {
                            res.json({msg: "Successfully saved"});
                        }

                    });
                } else {
                    res.json({message: "Movie already exists"});
                }

            });
        }
    })

    .get(authJwtController.isAuthenticated, function (req, res) {
        if(req.query.movieId != null){
            Movie.find({_id: mongoose.Types.ObjectId(req.query.movieId)}, function(err, data){
                if(err){
                    res.status(400).json({message: "Invalid query"});
                }else if(data.length == 0) {
                    res.status(400).json({message: "No entry found"});
                }else{
                    if(req.query.reviews == "True"){
                        Movie.aggregate([
                            {
                                $match: {'_id': mongoose.Types.ObjectId(req.query.movieId)}
                            },
                            {
                                $lookup:{
                                    from: 'reviews',
                                    localField: '_id',
                                    foreignField: 'Movie_ID',
                                    as: 'reviews'
                                }
                            }],function(err, doc) {
                            if(err){
                                console.log("hi");
                                res.send(err);
                            }else{
                                console.log(doc);
                                res.json(doc);
                            }
                        });
                    }else{
                        res.json(data);
                    }
                }
            });
        }else{
            Movie.find({}, function(err, doc){
                if(err){
                    res.json({error: err});
                }else{
                    if(req.query.reviews == "True"){
                        Movie.aggregate([
                            {
                                $lookup:{
                                    from: 'reviews',
                                    localField: '_id',
                                    foreignField: 'Movie_ID',
                                    as: 'reviews'
                                }
                            }],function(err, data) {
                            if(err){
                                res.send(err);
                            }else{
                                res.json(data);
                            }
                        });
                    }else{
                        res.json(doc);
                    }
                }
            })
        }

    })

    .put(authJwtController.isAuthenticated, function(req,res) {
        if(req.body.title != null && req.body.year_released != null && req.body.genre != null && req.body.actors != null && req.body.actors.length >= 3){
            Movie.findOneAndUpdate({title:req.body.Search},
                {
                    title: req.body.title,
                    year_released: req.body.year_released,
                    genre: req.body.genre,
                    actors: req.body.actors

                },function(err, doc){
                    if(err){
                        res.json({message: err});
                    }
                    else if (doc == null){
                        res.json({message:"Movie Not Found"})
                    }else{
                        res.json({data: doc, message:"Movie Updated"})
                    }
                });
        }else
        {
            res.status(400).json({message: "Please no null values"});
        }
    })

    .delete(authJwtController.isAuthenticated, function(req,res){
        Movie.findOneAndDelete({title: req.body.title}, function(err, doc){
            if(err){
                res.status(400).json({message:err});
            }
            else if (doc == null){
                res.json({message: "Movie not found"});
            }
            else{
                res.json({message: "Movie deleted"});
            }

        });
    });

var mongoose = require('mongoose');

router.route('/movies/:movieId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = mongoose.Types.ObjectId(req.query.movieId);
        if (req.query.reviews == "true") {
            // If reviews query parameter is "true", include movie information and reviews
            Movie.aggregate([
                { $match: { '_id': mongoose.Types.ObjectId(req.query.movieId)} },
                { $lookup: { from: "reviews", localField: "_id", foreignField: "Movie_ID", as: "reviews" } },
                { $sort: { "reviews.createdAt": -1 } }
            ], function (err, movie) {
                if (err) {
                    return res.status(400).json({ success: false, message: "Error retrieving movie and reviews." });
                } else {
                    return res.status(200).json({ success: true, movie: movie[0] });
                }
            });
        } else {
            // If reviews query parameter is not provided or is not "true", only include movie information
            Movie.findById(id, function (err, movie) {
                if (err) {
                    return res.status(400).json({ success: false, message: "Error retrieving movie." });
                } else {
                    return res.status(200).json({ success: true, movie: movie });
                }
            });
        }
    });


router.route('/reviews')
    .post(authJwtController.isAuthenticated, function(req,res){

        const usertoken = req.headers.authorization;
        const token = usertoken.split(' ');
        const decoded = jwt.verify(token[1], process.env.SECRET_KEY);

        Movie.find({_id: req.body.Movie_ID}, function(err, data){
            if(err){
                res.status(400).json({message: "Invalid query"});
            }else if (data != null){
                let rev = new Review({
                    username: decoded.username,
                    review: req.body.review,
                    rating: req.body.rating,
                    movie_ID: req.body.movie_ID
                });

                console.log(req.body);

                rev.save(function(err){
                    if(err) {
                        res.json({message: err});
                    }else{
                        Review.find({Movie_ID: req.body.Movie_ID}, function (err, allReviews) {
                            if(err){
                                res.status(400).json({message: "It's broken!"});
                            }else{
                                var avg = 0;

                                allReviews.forEach(function (review) {
                                    avg += review.rating;
                                    console.log(review);
                                });
                                avg = avg / allReviews.length;


                                Movie.update(
                                    { _id: req.body.Movie_ID},
                                    { $set: { averageRating: avg} }, function (err, doc){
                                        if (err){
                                            res.json({error: err});
                                        }else if(doc != null){
                                            res.json({msg: "Review successfully saved"});
                                        }
                                    });

                            }
                        });

                    }

                });
            }else{
                res.json({failure: "Movie does not exist"});
            }
        });
    });

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only

