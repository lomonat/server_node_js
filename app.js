const http = require('http');
const fs = require("fs");
const https = require('https');
const { detect } = require('detect-browser');
const useragent = require('useragent');
var speedTest = require('speedtest-net');


const months = ["January", "February", "March", "April", "May", "June", "July",
         "August", "September", "October", "November", "December"];


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
});

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
    const browser = detect();
    var agent = useragent.parse(req.headers['user-agent']);
    var agentOS = agent.os.toString();
    var agentBrowser = agent.toAgent();
    var agentDevice = agent.device.toString();

    var test = speedTest({maxTime: 5000});

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
