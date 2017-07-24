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
      
      fillTable(title, url);
    }
  }
});

function fillTable(title, url) {
  const table = document.getElementById('table');
  
  let row = table.insertRow(1);
  let cellTitle = row.insertCell(0);
  let cellUrl = row.insertCell(1);
  
  let anchor = document.createElement('a');
  anchor.setAttribute('href', url);
  anchor.innerHTML = url;
  
  cellTitle.innerHTML = title;
  cellUrl.appendChild(anchor);
}