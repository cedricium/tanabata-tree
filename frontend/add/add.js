const errorNotif = document.getElementById('error');

const btnRemove = document.getElementById('remove');
btnRemove.addEventListener('click', () => {
  errorNotif.style.visibility = 'hidden';
});

const btnAdd = document.getElementById('add');
btnAdd.addEventListener('click', () => {
  let title = document.getElementById('title').value;
  let url = document.getElementById('url').value;
  
  title = title.trim();
  url = url.trim();
  
  // error handling (checking for empty values)
  if (title.length === 0 || url.length === 0) {
    errorNotif.style.visibility = 'visible';
    return false;
  }
  
  // making GET request
  let xml = new XMLHttpRequest();
  xml.addEventListener('load', requestListener);
  xml.open('GET', '../add/' + title + '/' + url);
  xml.send();
  
  function requestListener() {
    console.log(this.responseText);
  }
});