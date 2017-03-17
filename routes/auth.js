module.exports = function (app, settings) {
    var url = require('url'),
        express = require('express'),
        router = express.Router(),
        passport = settings.passport;

    router.post('/local-login', passport.authenticate('local-login', {
        failureFlash: true,
        session: true,
    }));

    router.post('/local-signup', passport.authenticate('local-signup', {
        session: false,
        failureFlash: true
    }), function (req, res) {
        var failureFlash = req.flash('signupMessage');
        if (failureFlash.length > 0) {
            res.send({ errors: failureFlash });
        } else {
            res.sendStatus(200);
        }
    });

    app.use('/auth', router);
};