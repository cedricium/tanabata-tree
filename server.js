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
  response.status(200);
  response.send(urls);
});

app.enable('strict routing');

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
      response.status(400);
      reply = {
        tanzaku,
        message: 'tanzaku_upload_failed',
        status: 'failed'
      };
      
      response.send(reply);
      throw err;
    } else {
      console.log('tanzaku_added: ' + JSON.stringify(tanzaku));
      
      response.status(201);
      reply = {
        tanzaku,
        message: 'tanzaku_uploaded',
        status: 'success'
      };

      response.send(reply);
    }
  }
}

const meta = require('minimal-metainspector');

/**
 * "gettitle/" route - Used to obtain the title of the requested URL
 *
 * hostname:[port]/gettitle/[url]
 * @params {string} url - the requested URL to get the title from
 */
app.get('/gettitle', getTitle); 
function getTitle(request, response) {
  let url = request.query.url;
  
  // get title using 'minimal-metainspector'
  let client = new meta(url);
  let title = '';
  
  client.on('fetch', () => {
    title = client.title;
    
    response.status(200);
    reply = {
      url: url,
      title: title,
      message: 'get_title',
      status: 'success'
    };
    
    response.send(reply);
  });
  
  client.on('error', (err) => {
    response.status(400);
    reply = {
      url: url,
      title: title,
      message: 'get_title_failed',
      status: 'failed',
      err: err
    };
    
    response.send(reply);
  });

  client.fetch();
}