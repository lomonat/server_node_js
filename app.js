const http = require('http');
const fs = require("fs");
const https = require('https');
const useragent = require('useragent');
const speedTest = require('speedtest-net');
const mobile = require('is-mobile');
const locale = require("locale");

const months = ["January", "February", "March", "April", "May", "June", "July",
         "August", "September", "October", "November", "December"];
const browsers = ["opera", "ie", "chrome", "safari", "mobile_safari", "firefox"];
const browserslinks = ['https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Opera_2015_icon.svg/1200px-Opera_2015_icon.svg.png',
'https://i0.wp.com/wptavern.com/wp-content/uploads/2017/04/ie-logo.jpg?ssl=1',
'https://www1-lw.xda-cdn.com/files/2018/01/Chrome-Feature-Image-Background-Colour-810x298_c.png',
'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsr4ty4dNFIalHmqhrNNMwnYe0HBzt5cPxb2G2od66N1tIwSuY',
'https://i1.wp.com/it-here.ru/wp-content/uploads/2015/03/Problemy-s-Safari-iOS-8.21.jpg?fit=590%2C332&ssl=1',
'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQKPXiwTTHS87WPoSqLL4dPVhC-EZhldL-W5hR2a3WGHcfhEV0Lg',
];

// parse minutes if it has only 1 digit -> append 0, 5 -> 05
 function minuresParser(minutes) {
   if(minutes.toString().length < 2){
     minutes = minutes.toString()+0;
   }
   return minutes;
 }

const server = http.createServer((req, res) => {
  if(req.url === '/') {
    var d = new Date();

    // store the message
    const currentDayAndTime = 'Today is ' + d.getUTCDate() + '.' + months[d.getMonth()]
    + ' ' + d.getHours() + ':' + minuresParser(d.getMinutes()) + '\n';

    //to store the amount of request I use txt file visits.txt
    const request =  './visits.txt';

    fs.readFile(request, 'utf8', function (err,data) {
      if(data == '') {
        fs.writeFile(request, '0', function (err) {
          if (err) {
          return console.log(err);
          }
        });
      } else {
        var data = parseInt(data) + 1;
        fs.truncate(request, 0, function (err) {
          if (err) {
            return console.log(err);
          }
        });
        fs.writeFile(request, data , function (err) {
          if (err) {
            return console.log(err);
          }
          const response =  currentDayAndTime + 'amount of visits is ' + data;
          console.log(response)
          res.write(response);
          res.end();

        });
      }
    });
  }

  if(req.url === '/whoami') {
      fetchData(req, res);
    }
  if(req.url === '/adapt2user') {
    var msg = "";
      fetchDataFoAdapting(msg, req, res);
          }
      });


function fetchDataFoAdapting(msg, req, res) {

   // choose the best suited language for user
   //https://github.com/florrain/locale
    var locales = new locale.Locales(req.headers["accept-language"]);

    msg = msg +  "Your language is " + locales.best() + "\n";

    for (var i in browsers) {
    if(useragent.is(req.headers['user-agent'])[browsers[i]]) {
    msg = msg + "and you are using " + browsers[i];
    msg = '<div>'+ msg+'</div><img src="' + browserslinks[i] + '">';
    break;
      }
    }


    var colorDiv = ' ';
    if(!mobile()) {
       colorDiv = '<div style="background-color: #ffff42; width: 50px; height: 50px"></div><p>You see this yellow square because you use not mobile ver</p>';
    }
    msg = msg + colorDiv;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(msg);
    res.end();
}


function fetchData(req, res) {
  //Get request with help of api ipdata
  //https://www.twilio.com/blog/2017/08/http-requests-in-node-js.html

  https.get("https://api.ipdata.co", (resp) => {
  let data = '';

  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    var dataParsed = JSON.parse(data);
    var agent = useragent.parse(req.headers['user-agent']);
    var agentOS = agent.os.toString();
    var agentBrowser = agent.toAgent();
    var agentDevice = agent.device.toString();
    var test = speedTest({maxTime: 1000});

    test.on('data', data => {
      var msg = "Your ip is " + dataParsed.ip + ", your city is " + dataParsed.city
      + ", your region is " + dataParsed.region + ", your country name is " + dataParsed.country_name
      + ", your language is " + dataParsed.languages[0].name + ". " +
      "Your OS is " + agentOS + " ,your browser is " + agentBrowser
      + " , your device is " + agentDevice + ". Download bandwidth in megabits per second: " +
      data.speeds.download + ". Upload bandwidth in megabits per second: "
      + data.speeds.upload ;
      res.write(msg);
      res.end();

    });

    test.on('error', err => {
      console.error(err);
    });

  });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}

server.listen(3000);
console.log("Listening on port 3000..");
