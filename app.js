var express = require('express');
var request = require('request');
var app = express();

const PORT = 3000;

app.get('/check/:reg', function(req, res) {

    var input = req.params.reg;

    // Initial GET request to set session cookies
    request({
        method: 'GET',
        url: 'https://motor.confused.com/',
        jar: true       // Remember cookies
    }, function(err, response, body) {

        // POST request to lookup up reg
        request({
            method: 'POST',
            url: 'https://motor.confused.com/Motor/RegistrationLookup',
            form: {
                registrationNumber: input
            },
            json: true, // Set response content-type to json
            jar: true   // Remember cookies

        },
        function(err, response, body) {

            var result = {
                input: input
            };

            if (!body || !body.data) {
                result.match = false;
                result.message = 'No vehicle found';
            } else {
                result.match = true;
                // PROCESS BODY
                var vehicleData = body.data;

                // vehicle property is returned as JSON string - convert to JSON object
                if (vehicleData.vehicle) {
                    var vehicleObjectStr = vehicleData.vehicle;
                    var vehicleObject = JSON.parse( vehicleObjectStr );
                    vehicleData.vehicle = vehicleObject;
                }

                result.vehicleData = vehicleData;

                // Get vehicle image
                getImageBase64(result.vehicleData.ABICode, function(data) {
                    result.vehicleImage = data;

                    // Send response
                    res.json( result );


                });
            }

        });

    });

});

app.listen(PORT);
console.log('Listening on port', PORT);


/* HELPER FUNCTIONS */

function getImageBase64(abiCode, cb) {
    request({
        method: 'GET',
        url: 'https://motor.confused.com/Image/VehicleImage/' + abiCode,
        encoding: null,
        jar: true       // Remember cookies
    }, function(err, response, body) {

        if (!err && response.statusCode == 200) {
            data = "data:" + response.headers["content-type"] + ";base64," + new Buffer(body).toString('base64');
            cb(data);
        }

    });
}

//request.get('http://tinypng.org/images/example-shrunk-8cadd4c7.png', function (error, response, body) {
//});