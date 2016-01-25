var http = require('http');
var https = require('https');

var Stream = require('stream').Stream;

var config = require('../config/api');

var mm = require('musicmetadata');
var fs = require('fs');

//Takes in a callback that accepts an error object and json data
function responseJSON(callback){
    return function(err, response){
        if(err){
            callback(err);
        }else{
            var jsonString = '';
            response.on('data', function(chunk){
                jsonString += chunk;
            });

            response.on('end', function(){
                var json = JSON.parse(jsonString);
                callback(null, json);
            });
        }
    };
}

function getProtocol(url){
    if(url.indexOf('https') === 0){
        return https;
    }else{
        return http;
    }
}

function forceHTTP(url){
    if(url.indexOf('https') === 0){
        return 'http' + url.substring(5);
    }
    return url;
}

//redirect callback takes in the redirect URL as a parameter
//normal callback takes in a possible error object and the server response as a callback
function checkRedirect(url, redirectCallback, normalCallback){
    var protocol = getProtocol(url);
    var req = protocol.get(url, function(response){
        if(~~(response.statusCode/100) === 3){ //is redirect
            redirectCallback(response.headers.location);
        }else{
            normalCallback(null, response);
        }
    });
    req.on('error', function(err){
        console.log(err);
        normalCallback(err);
    });
}

//TODO make sure this can't loop forever. That's bad
function autoRedirect(url, callback){
    checkRedirect(url, function(url){
        autoRedirect(url, callback);
    }, callback);
}

function addQueryString(url, qstr){
    if(url.indexOf('?') > -1){
        return url + '&' + qstr;
    }else{
        return url + '?' + qstr;
    }
}

function trimQuery(url){
    return url.substring(0, url.indexOf('?'));
}

//cb takes an error message (null if no errors) and song data
function parseSoundcloud(url, cb){
    autoRedirect('http://api.soundcloud.com/resolve.json?url='+url+'&client_id='+config.soundcloud_id,
        responseJSON(function(err, json){
            if(err){
                cb('Error fetching provided url');
            }else{
                if(!(json.title && json.user.username && json.duration && json.genre && json.stream_url)){
                    cb('Provided url returned bad data');
                }else{
                    var song = {};
                    song.title = json.title;
                    song.artist = json.user.username;
                    //TODO add in storage for images (not that it applies here)
                    if(json.artwork_url){
                        song.image = json.artwork_url.replace(/-[^-]*\.(jpg|png|jpeg|gif)$/, '-crop.$1');
                    }
                    song.length = json.duration;
                    song.genre = json.genre;
                    song.provider = 'soundcloud';
                    checkRedirect(json.stream_url + '?client_id=' + config.soundcloud_id, function(url){
                        song.uri = forceHTTP(url);
                        cb(null, song);
                    }, function(response){
                        console.log('ERROR: This should have been a redirect');
                        cb('Provided url returned bad data');
                    });
                }
            }
        })
    );
}

//Used for creating unique names for album artwork
var artworkIndex = 0;

//PREREQS:
// File is non-null, a valid file provided by multer
// params is non-null
// cb is non-null callback accepting a possible error and song data
function parseFile(file, params, cb){
    song = {};
    //TODO also do metadata extraction
    song.uri = file.path;
    mm(fs.createReadStream(file.path), function(err, metadata){
        if(err){
            console.log(err);
        }
        if(params.artist){
            song.artist = params.artist;
        }else{
            if(metadata && metadata.artist){
                song.artist = metadata.artist[0];
            }
        }

        if(params.title){
            song.title = params.title;
        }else{
            if(metadata && metadata.title){
                song.title = metadata.title;
            }
        }

        //For a picture, the metadata returns an array (for possible multiple artworks)
        //where each elements is {format: <String>, data: <Buffer> }
        if(metadata && metadata.picture && metadata.picture.length > 0){
            fs.writeFile('./artwork/'+artworkIndex, metadata.picture[0].data, function(err){
                if(err){
                    console.log(err);
                    cb('Artwork error encountered. Most likely a server issue');
                }else{
                    song.image = '/art/'+artworkIndex;
                    artworkIndex++;
                    cb(null, song);
                }
            });
            return;
        }
        cb(null, song);
    });
}

function parseYoutube(url, cb){

}

exports.parseSoundcloud = parseSoundcloud;

exports.parseYoutube = parseYoutube;

exports.parseFile = parseFile;
