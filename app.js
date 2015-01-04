/**
 * Created with lavamelon-sails-cms-core.
 * User: deviozc
 * Date: 2014-12-28
 * Time: 04:27 AM
 * To change this template use Tools | Templates.
 */
var MongoClient = require('mongodb').MongoClient;
(function() {
    var geocoderProvider = 'google';
    var httpAdapter = 'http';
    var geocoder = require('node-geocoder').getGeocoder(geocoderProvider, httpAdapter);
    MongoClient.connect('mongodb://127.0.0.1:27017/sails', function(err, db) {
        var collection = db.collection('property');
        collection.find({
            status: 'imported'
        }).limit(2000).toArray(function(err, properties) {
            if(err) {
                console.log(err);
            }
            var i = 0;
            (function loop() {
                var property = properties[i];
                var address = property.fullAddress + ", " + property.city + ", BC, Canada";
                geocoder.geocode(address, function(err, res) {
                    collection.update({
                        _id: property._id
                    }, {
                        $set: {
                            status: 'processed',
                            location: {
                                longitude: res[0].longitude,
                                latitude: res[0].latitude,
                            }
                        }
                    }, function(err, result) {
                        console.log(res);
                    });
                });
                if(++i < properties.length) {
                    setTimeout(loop, 500); // call myself in 2 seconds time if required
                } else {
                    db.close();
                }
            })();
        });
    });
})();