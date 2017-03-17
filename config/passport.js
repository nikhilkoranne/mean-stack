var LocalStrategy = require('passport-local').Strategy,
    async = require('async');
var UserModel = require('./../server.js');
let mail_queue = require('./../send.js');
// Create a list of users just for demo.
// In reality, you will probably query a database
// to fetch this user
var users = [];
var sessionUser = {};

function createAccount(newUser, callback) {
    // Call API to create account
    let user = new UserModel.UserModel({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        age: newUser.age
    });
    user.save(function (err) {
        if (err) return next(err);
        //res.sendStatus(201);
        //add to queue
        sessionUser = newUser;
        mail_queue.send_to_queue(newUser);
        console.log(`added ${newUser.name}`);
        callback(null, newUser);
    });

}

// Invokes callback with a non-empty object if email already exists, null otherwise
function findExistingEmail(email, callback) {
    // Call API to check if the email already exists

    UserModel.UserModel.find({}, function (err, users) {
        if (err) return next(err);
        users = users;

        var len = users.filter(function (user) {
            return user.email == email;
        }).length;

        if (len > 0) {
            callback({ message: 'Email Already Exists' });
        } else {
            callback(null, null);
        }
    });


}

module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.email || ''); // This is what passport will save in the session/cookie
    });

    passport.deserializeUser(function (email, done) {
        // Use the email saved in the session earlier
        // to fetch the actual user
        done(null, sessionUser || {});
    });

    // We name our strategy 'local-login'.
    // You can use any name you wish
    // This is the name you will refer to later in a route
    // that handles the login
    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
        function (req, email, password, done) {
            if (users[email] && users[email].password === password) {
                return done(null, users[email]);
            } else {
                done(null, false, req.flash('message', 'Invalid email or password'));
            }
        }));

    passport.use('local-signup',
        new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // Pass back the entire request to the callback
        }, function (req, email, password, done) {

            process.nextTick(function () {

                async.auto({
                    doesEmailAlreadyExist: function (cb, results) {
                        findExistingEmail(email, cb);
                    },
                    newAccount: ['doesEmailAlreadyExist',
                        function (cb, results) {

                            var newUser = {
                                email: email,
                                password: password,
                                name: req.body.name,
                                age: req.body.age
                            };
                            createAccount(newUser, results);
                        }
                    ]
                }, function (err, results) {
                    if (err) {
                        done(null, true, req.flash('signupMessage', err.message));
                    } else {
                        done(null, results.newAccount);
                    }
                });

            });
        })
    );

};