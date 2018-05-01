var http = require('http');
var https = require('https');
var url = require('url');
var jstoxml = require('./jstoxml');
var responsetype = require('./responsetype');
var error = require('./error').errors;
var baseURL = "http://ip-api.com/"
module.exports.fireRequest = function (domainOrip, reponseType, callback) {
   reponseType= reponseType.toLowerCase();
    var indexOf = responsetype.type.indexOf(reponseType.toLowerCase());
    if(indexOf>-1){
    if (reponseType === 'xml')
    {
        reponseTypeTemp = 'json';
    } else
    {
        reponseTypeTemp = reponseType
    }
    var urlData = url.parse(baseURL + reponseTypeTemp + "/" + domainOrip)
    var http_ = urlData.protocol === 'https:' ? https : http

    var done = function (err, result) {
        callback(err, result)
    }

    var req = http_.request(urlData, function (res) {
        var data = ''
        res.on('data', function (buffer) {
            data += buffer.toString('utf8')
        })

        res.on('end', function () {


            parseResponse(data, reponseType, done)


        });
    });

    req.on('error', done)

    req.end()
}else
{
  callback(null, error['incorrect_formate'])
}

};

function parseResponse(data, responseType, done)
{
    if (responsetype.JSON === responseType)
    {

        data = JSON.parse(data)
        if (data.status === 'fail')
        {
            error_code = data.message.replace(/ /g, '_');
            done(null, error[error_code]);
        }
        else {

            done(null, data);
        }


    } else if (responsetype.CSV === responseType)
    {

        dataArray = data.split(',')

        if (dataArray[0] === 'fail')
        {
            error_code = dataArray[1].replace(/"/g, '').replace(/ /g, '_');
            done(null, error[error_code]);
        } else
        {
            done(null, data);
        }

    } else if (responsetype.XML === responseType)
    {

        data = JSON.parse(data)
        if (data.status === 'fail')
        {
            error_code = data.message.replace(/ /g, '_');
            done(null, error[error_code]);
        }
        else {
            result = jstoxml.toXML(data);
            done(null, result);
        }
    } else if (responsetype.LINE === responseType)
    {
        dataArray = data.split('\n')
        if (dataArray[0] === 'fail')
        {
            error_code = dataArray[1].replace(/ /g, '_');
            done(null, error[error_code]);
        } else
        {
            done(null, data);
        }
    }


}
