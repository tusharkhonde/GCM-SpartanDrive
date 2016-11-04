var express = require('express');
var http  = require("http");
var async = require('async');
var router = express.Router();
var connection = require('../connection/db.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/app_user',function(req,res) {
    async.waterfall([
        function(callback) {
            connection.query('select * from app_user',
                function(err, result) {
                    if (err)  return callback("Error", null);
                    else {
                        console.log('app-user table details');
                        for (var i in result) {
                            var user = result[i];
                            console.log("email -> "+user.email_id +" reg_id -> "+ user.reg_id );
                        }
                        return callback(null, result);
                    }

                });
        }],
    function (err, result) {
        if(err) {
            console.log(err);
            res.json({msg:"error"});
        }
        console.log(result);
        res.json({msg:"success",user:result});
    });
});

router.get('/app_user/:email_id',function(req,res){

    async.waterfall([
            function(callback) {
                connection.query('select reg_id from app_user Where email_id = ?', [req.params.email_id],
                    function (err, result) {
                        if (err) return callback("Error",null)
                        else {
                            console.log('app-user table details');
                            console.log(" reg_id -> " + result[0].reg_id);
                            return callback(null,result[0].reg_id)
                        }
                    });
            }],
        function (err, result) {
            if(err) {
                console.log(err);
                res.json({msg:"error"});
            }
            console.log(result);
            res.json({msg:"success",user:result});
        });


});

router.post('/app_user', function(req,res) {

    async.waterfall([
            function(callback) {
                var user = { email_id: req.body.email_id, reg_id: req.body.reg_id };
                connection.query('INSERT INTO app_user SET ?', user, function(err,res){
                    if(err) {
                        connection.query(
                            'UPDATE app_user SET reg_id = ? WHERE email_id=?',
                            [user.reg_id,user.email_id],
                            function (err, result) {
                                if (err) return callback({"msg":"Update Error"},null);
                                console.log(req.body.email_id + " -> "+ req.body.reg_id);
                                console.log('Changed ' + result.changedRows + ' rows');
                               return callback(null,{"msg":"updated"});
                            });
                    }
                    else {
                        console.log('Inserted');
                        return callback(null,{"msg":"inserted"});
                    }
                });
            }],
        function (err, result) {
            if(err) {
                console.log(err);
                res.json(err);
            }
            console.log(result);
            res.json(result);
        });
});

router.post('/app_user/update', function(req,res){

    async.waterfall([
            function(callback) {
                var reg_id = req.body.reg_id;
                var email_id = req.body.email_id
                connection.query(
                    'UPDATE app_user SET reg_id = ? WHERE email_id=?',
                    [reg_id,email_id],
                    function (err, result) {
                        if (err)  return callback({"msg":"Update Error"},null);
                        console.log(req.body.email_id + " -> "+ req.body.reg_id);
                        console.log('Changed ' + result.changedRows + ' rows');
                        return callback(null,{"msg":"updated"});
                    });
            }],
        function (err, result) {
            if(err) {
                console.log(err);
                res.json(err);
            }
            console.log(result);
            res.json(result);
        });
});

router.delete('/app_user/:email_id', function(req,res){

    async.waterfall([
            function(callback) {
                connection.query(
                    'DELETE FROM app_user WHERE email_id = ?',
                    [req.params.email_id],
                    function (err, result) {
                        if (err) return callback({"msg":"Delete Error"},null);
                        console.log('Deleted ' + result.affectedRows + ' rows');
                        return callback(null,{"msg":"deleted"});
                    });
            }],
        function (err, result) {
            if(err) {
                console.log(err);
                res.json(err);
            }
            console.log(result);
            res.json(result);
        });


});



// GCM Modules
router.post('/app_user/share', function(request,response) {

    var sender_id = request.body.s_email_id;
    var receiver_id = request.body.r_email_id;

    async.waterfall([
        function(callback) {
            connection.query('select reg_id from app_user Where email_id = ?', [receiver_id],
                function (err, result) {
                    if (err) console.log(err);
                    else {
                        console.log('app-user table details');
                        console.log(" reg_id -> " + result[0].reg_id);

                        return callback(null,JSON.stringify(
                            {
                                "collapseKey": "applice",
                                "data": {
                                    "message": "File shared from " + sender_id, "title": "Spartan Drive"
                                },
                                "registration_ids": [result[0].reg_id]

                            }))
                    }
                });
        },
        function(post_data, callback) {

            var options = {
                hostname: "android.googleapis.com",
                port: 80,
                path: "/gcm/send",
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "content-length": post_data.length,
                    "authorization": "Key=google_key"
                }
            };
            return callback(null,post_data,options);
        },
        function(post_data,options, callback) {

            var req = http.request(options, function (res) {

                var str = '';
                res.setEncoding("utf8");
                res.on("data", function (chunk) {
                    console.log("BODY: " + chunk);
                    str += chunk;
                });
                res.on('end', function () {
                    console.log(str);
                });

                console.log("Status: " + res.stat);
                console.log("HEADERS: " + JSON.stringify(res.headers));

            });

            req.on("error", function (e) {
                console.log("problem with request" + e.message);
                console.log(e.stack);
                callback("Error",null);
            });

            req.write(post_data);
            req.end();

            callback(null,"OK");

        }
    ], function (err, result) {
        if(err) {
            console.log(err);
            response.json({msg:"error"});
        }
        console.log(result);
        response.json({msg:"success"});
    });

});

module.exports = router;
