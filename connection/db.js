var mysql = require('mysql');

/**
 * Created by TUSHAR_SK on 12/5/15.
 */

var connection = mysql.createConnection({ // Mysql Connection
    host     : 'gcmdb.cjvnpjckxvi2.us-west-1.rds.amazonaws.com',
    port     : '3306',
    user     : 'tushar',
    password : 'dbpassgcm',
    database : 'gcmdb'

});


connection.connect(function(err){
    if(!err) {
        console.log("Database is connected ... nn");
    } else {
        console.log("Error connecting database ... nn");
    }
});

connection.query('select * from app_user',
    function(err) {
        if (err){
            console.log('app-user table not present');
            connection.query('CREATE TABLE app_user ( email_id VARCHAR(50), reg_id VARCHAR(200), PRIMARY KEY(email_id))', function(err, result){
                // Case there is an error during the creation
                if(err) {
                    console.log(err);
                }
                else{
                    console.log("Table app_user Created");
                }
            });
        }
        else {
            console.log('app-user table');
        }

    });



module.exports = connection;