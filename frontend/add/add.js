const errorNotif = document.getElementById('error');

const btnRemove = document.getElementById('remove');
btnRemove.addEventListener('click', () => {
  errorNotif.style.visibility = 'hidden';
});

const btnAdd = document.getElementById('add');
btnAdd.addEventListener('click', submit)

function submit() {
  btnAdd.classList.add('is-loading');
  
  let title = document.getElementById('title').value;
  let url = document.getElementById('url').value;
  
  title = title.trim();
  url = url.trim();
  
  // error handling (checking for empty values)
  if (title.length === 0 || url.length === 0) {
    errorNotif.style.visibility = 'visible';
    btnAdd.classList.remove('is-loading');
    return false;
  }
  
  // making GET request
  let xml = new XMLHttpRequest();
  xml.addEventListener('load', requestListener);
  xml.open('GET', '../add/' + title + '/' + url);
  xml.send();
  
  function requestListener() {
    let data = this.responseText;
    let response = JSON.parse(data);
    console.log(response);
    
    responseHandler(response);
  }
}

function responseHandler(response) {
  if (response.status === 'success') {
    btnAdd.classList.remove('is-loading');
    
    // change button to direct to tanzakus list
    btnAdd.innerHTML = 'Success! Click again to view tanzakus.';
    btnAdd.removeEventListener('click', submit);
    btnAdd.addEventListener('click', viewTanzakus);
  }
}

function viewTanzakus() {
  window.location.href = '../all/tanzakus.html#recent';
}