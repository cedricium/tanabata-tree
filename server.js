const fs = require('fs');

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// wwwhisper authentication
const wwwhisper = require('connect-wwwhisper');
app.use(wwwhisper());

app.use(express.static('frontend'));
app.use(express.static('frontend/add'));

app.listen(port);
console.log('Server started at localhost:' + port);

let data = fs.readFileSync('tanzakus.json');
let urls = JSON.parse(data);


/**
 * "all/" route - Used to obtain all tanzakus in tanabata-tree
 *
 * hostname:[port]/all
 * @params {null} NONE
 */
app.get('/all', function(request, response) {
  response.send(urls);
});


/**
 * "add/" route - Used to add a tanzaku to tanabata-tree
 *
 * hostname:[port]/add/[title]/[url]
 * @param {string} title - the title of the URL being added
 * @param {string} url - the URL to be added
 */
app.get('/add/:title/*', addUrl);
function addUrl(request, response) {
  let data = request.params;
  let title = data.title;
  let url = data[0];
  
  let reply;
  let tanzaku = {
    title: title,
    url: url
  };
  
  urls[title] = url;
  let tanzakuData = JSON.stringify(urls, null, 2);
  
  fs.writeFile('tanzakus.json', tanzakuData, finished);
  
  function finished(err) {
    if (err) {
      reply = {
        tanzaku,
        message: 'Tanzaku not added.',
        status: 'failed'
      };
      
      response.send(reply);
      throw err;
    } else {
      console.log('tanzaku_added: ' + JSON.stringify(tanzaku));
      
      reply = {
        tanzaku,
        message: 'tanzaku added',
        status: 'success'
      };

      response.send(reply);
    }
  }
}