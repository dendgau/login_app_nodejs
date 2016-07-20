var express = require('express'),
    UserModel = require('../models/user'),
    mongoose = require('mongoose'),
    router = express.Router();

router.get('/', function(req, res, next) {
    res.redirect("/users/me");
});

router.get('/me', function(req, res, next) {
    if (checkIsLogin(req)) {
        res.render('users/profile',  { title: "Login", userInfo: req.session.user });
    } else {
        res.redirect("/users/login");
    }
});

router.post('/logout', function(req, res, next) {
    if (checkIsLogin(req) && req.body.submitLogout) {
        logoutUser(req);
        res.redirect("/users/login");
    }
});


router.get('/login', function(req, res, next) {
    if (checkIsLogin(req)) {
        res.redirect("/users/me");
    } else {
        res.render('users/login',  { title: "Login", errorForm: [], infoForm: [] });
    }
});

router.post('/login', function(req, res, next) {
    if (req.body.submitLogin) {
        delete req.body.submitLogin;
        var errors = checkLoginSuccess(req.body, function(errorForm, infoForm) {
            console.log("Call callback to handle redirect");
            if (Object.keys(errorForm).length == 0) {
                loginUser(req, infoForm);
                res.redirect("/users/me");
            } else {
                console.log(infoForm);
                res.render('users/login',  { title: "Sign up", errorForm: errorForm ? errorForm : [], infoForm: infoForm });
            }
        });
    }
});

router.get('/signup', function(req, res, next) {
    if (checkIsLogin(req)) {
        res.redirect("/users/me");
    } else {
        res.render('users/signup',  { title: "Sign up", errorForm: [], infoForm: [] });
    }
});

router.post('/signup', function(req, res, next) {
    if (req.body.submitSignup) {
        delete req.body.submitSignup;
        var errors = checkValidFields(req.body, function(errorForm, infoForm) {
            console.log("Call callback to handle redirect");
            if (Object.keys(errorForm).length == 0) {
                createNewUser(infoForm);
                loginUser(req, infoForm);
                res.redirect("/users/me");
            } else {
                res.render('users/signup',  { title: "Sign up", errorForm: errorForm ? errorForm : [], infoForm: infoForm });
            }
        });
    }
});

function checkIsLogin(req) {
    if (req.session.user)
        return true;
    return false;
}

function loginUser(req, userInfo) {
    req.session.user = userInfo;
}

function logoutUser(req, userInfo) {
    delete req.session.user;
}

function createNewUser(infoNewUser) {
    var userModel = new UserModel(mongoose);
    userModel.addUser(infoNewUser);
}

function checkLoginSuccess(fields, callback) {
    var errors = {},
        userModel = new UserModel(mongoose),
        promise = userModel.checkEmailIsExist(fields['emailAddress']);

    promise.then(function (data) {
        console.log(data);
        if (data.length <= 0) {
            errors["emailAddress"] = 'Email is wrong';
        } else if (data[0].password != fields['password']) {
            errors["password"] = 'Password is wrong';
        }
        callback(errors, Object.keys(errors).length == 0 ? data[0] : fields);
    }, function (error) {

    });

    return errors;
}

function checkValidFields(fields, callback) {
    var errors = {};
    for (var fieldName in fields) {
        var fieldData = fields[fieldName];

        // Check empty field
        if (!fieldData) {
            errors[fieldName] = 'Please fill this field';
            continue;
        }

        // Check len password
        if (fieldName == "password" && !checkLenPassword(fieldData)) {
            errors[fieldName] = 'Password have to contain > 6 charater';
            continue;
        }

        // Check len field
        if (!checkLenField(fieldData)) {
            errors[fieldName] = 'The length have to > 3 and < 30';
            continue;
        }

        // Check valid First Name or Last Name
        if ((fieldName == "firstName" || fieldName == "lastName") && !checkValidName(fieldData)) {
            errors[fieldName] = 'This value is not valid';
            continue;
        }

        // Check valid Email
        if (fieldName == "emailAddress" && !checkValidEmail(fieldData)) {
            errors[fieldName] = 'Email is not valid';
            continue;
        }

        // Check Email is Existed
        if (fieldName == "emailAddress") {
            var userModel = new UserModel(mongoose),
                promise = userModel.checkEmailIsExist(fieldData);

            promise.then(function (data) {
                console.log(data);
                if (data.length > 0) {
                    errors["emailAddress"] = 'Email already exists';
                }
                callback(errors, fields);
            }, function (error) {

            });
        }
    }

    return errors;
}

function checkLenField(fieldData) {
    return fieldData.length > 3 && fieldData.length < 20 ? true : false;
}

function checkLenPassword(fieldData) {
    return fieldData.length > 6
}

function checkValidName(fieldData) {
    return /^[a-z ,.'-]+$/i.test(fieldData);
}

function checkValidEmail(fieldData) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(fieldData);
}

module.exports = router;
