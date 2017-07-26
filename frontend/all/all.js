document.addEventListener('DOMContentLoaded', () => {
  // making GET request
  let xml = new XMLHttpRequest();
  xml.addEventListener('load', requestListener);
  xml.open('GET', '../all');
  xml.send();
  
  function requestListener() {
    let data = this.responseText;
    let tanzakus = JSON.parse(data);
    
    let keys = Object.keys(tanzakus);
    for (let i = 0; i < keys.length; i++) {
      let title = keys[i];
      let url = tanzakus[title];
      
      if (i === keys.length - 1)
        fillTable(title, url, true);
      else
        fillTable(title, url, false);
    }
    
    ready();
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