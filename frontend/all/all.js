function highlight() {
  // gets recently-added tanzaku
  let recent = document.getElementById('recent');
  
  // gives recent tanzaku the 'base' class (highlighted)
  recent.classList.add('base');
  
  setTimeout(function() {
    // 1/2 a sec. later, adds the 'active' class to begin the transition to
    // the normal table row appearance
    recent.classList.add('active');
  }, 500);
  
  setTimeout(function() {
    // 2 secs. after adding the 'active' class, the 'base' class is removed
    // so any subsequent visits to the page will not highlight that tanzaku
    recent.classList.remove('base');
  }, 2500);
}

document.addEventListener('DOMContentLoaded', () => {
  // making GET request to the 'all' route of the API
  let xhr = new XMLHttpRequest();
  xhr.addEventListener('load', requestListener);
  xhr.open('GET', '../api/v1/tanzakus');
  xhr.send();
  
  function requestListener() {
    let data = this.responseText;
    let response = JSON.parse(data);
    
    // Error handling of bad database connection
    if (response.error) {
      let errorMessage = "Error connecting to the database. Please try again later. If the issue persists, ensure you can make a manual connection to the database to verify whether or not it is a database issue.";
      
      createModal(errorMessage);
      return;
    }
    
    // with the received data from the server, completes the table
    let keys = Object.keys(response);
    for (let i = 0; i < keys.length; i++) {
      let title = keys[i];
      let url = response[title];
      
      if (i === keys.length - 1)
        fillTable(title, url, true);
      else
        fillTable(title, url, false);
    }
    
    // if the page url is 'tanzaku.html#recent', highlight the most recent
    // tanzaku (this link originates from adding a tanzaku via
    // 'add/index.html')
    if (window.location.href.endsWith('recent'))
      highlight();
  }
});

function fillTable(title, url, recent) {
  const table = document.getElementById('table');
  let row = table.insertRow(1);
  
  if (recent === true)
    row.setAttribute('id', 'recent');
  
  let cellTitle = row.insertCell(0);
  let cellUrl = row.insertCell(1);
  
  let anchor = document.createElement('a');
  anchor.setAttribute('href', url);
  anchor.innerHTML = url;
  
  cellTitle.innerHTML = title;
  cellUrl.appendChild(anchor);
}