const LOAD_TANZAKUS_AMOUNT = 5;
let tanzakusCurrentlyShowing = 0;

let currentTanzakuFilter = '';

let cards = document.getElementsByClassName('card-body');

document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  loader.classList.remove('hidden');

  currentTanzakuFilter = 'all';
  document.getElementsByClassName('filter')[0].classList.add('is-active');
  
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
      let errorTitle = 'Something went wrong! &#128557;';
      let errorMessage = "Error connecting to the database. Please try again later. If the issue persists, ensure you can make a manual connection to the database to verify whether or not it is a database issue.";
      
      loader.classList.add('hidden');
      createModal(errorTitle, errorMessage, false);
      return;
    }
    
    let size = Object.keys(response).length;

    for (let i = size - 1; i >= 0; i--) {
      let id = response[i].id;
      let url = response[i].url;
      let title = response[i].title;
      let desc = response[i].description;
      let has_been_visited = response[i].has_been_visited;
      let created_at = response[i].created_at;
      
      if (!id)
        id = '0101010';

      if (desc === 'undefined')
        desc = title;
      
      createCard(title, url, desc, has_been_visited, created_at, id);
    }

    loadMore(tanzakusCurrentlyShowing, tanzakusCurrentlyShowing + LOAD_TANZAKUS_AMOUNT);
    window.addEventListener('scroll', loadWhenBottomReached);
    
    loader.classList.add('hidden');
    
    let deleteBtns = document.getElementsByClassName('_delete');
    for (var i = 0; i < deleteBtns.length; i++)
      deleteBtns[i].addEventListener('click', deleteTanzaku);
  }
});


function loadMore(pos, len) {
  limit = 0;
  let limitIsMet = false;

  switch (currentTanzakuFilter) {
    case 'archived':
      while (limitIsMet === false) {
        for (let i = pos; i < cards.length; i++) {
          if (cards[i].dataset.visited === 'true' && cards[i].classList.contains('hidden')) {
            cards[i].classList.remove('hidden');
            limit++;

            if (limit === len) {
              limitIsMet = true;
              break;
            }
          }
          if (i === cards.length - 1)
            document.querySelector('.load-more').classList.add('hidden');
        }
        break;
      }
      break;
    case 'new':
      while (limitIsMet === false) {
        for (let i = pos; i < cards.length; i++) {
          if (cards[i].dataset.visited === 'false' && cards[i].classList.contains('hidden')) {
            cards[i].classList.remove('hidden');
            limit++;

            if (limit === len) {
              limitIsMet = true;
              break;
            }
          }
          if (i === cards.length - 1)
          document.querySelector('.load-more').classList.add('hidden');
        }
      }
      break;
    case 'all':
      while (limitIsMet === false) {
        for (let i = pos; i < cards.length; i++) {
          if (cards[i].classList.contains('hidden')) {
            cards[i].classList.remove('hidden');
            limit++;

            if (limit === len) {
              limitIsMet = true;
              break;
            }
          }
          if (i === cards.length - 1)
          document.querySelector('.load-more').classList.add('hidden');
        }
      }
      break;
  }
  tanzakusCurrentlyShowing += LOAD_TANZAKUS_AMOUNT;
}


function loadWhenBottomReached() {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
    loadMore(tanzakusCurrentlyShowing, LOAD_TANZAKUS_AMOUNT);
  }
}


function activateFilter(e) {
  let currentFilter = currentTanzakuFilter;
  if (currentFilter === e.target.dataset.filter)
    return;
  
  document.querySelector('.filter.is-active').classList.remove('is-active');
  e.target.classList.add('is-active');
  currentTanzakuFilter = e.target.dataset.filter
  clearTanzakus();
  loadMore(0, LOAD_TANZAKUS_AMOUNT);
}


function clearTanzakus() {
  for (let i = 0; i < cards.length; i++) {
    cards[i].classList.add('hidden');
  }
  tanzakusCurrentlyShowing = 0;
}


function deleteTanzaku() {
  let id = this.getAttribute('data-id');
  
  // confirm deletion of tanzaku
  let deleteTitle = 'Finished with this tanzaku?';
  let deleteMessage = 'Are you sure you want to delete this tanzaku?';
  
  createModal(deleteTitle, deleteMessage, true, id);
}

function continueDeletion(should_delete, id) {
  let apiDeleteUrl = '../api/v1/tanzakus/' + id;
  
  if (should_delete) {
    let xhr = new XMLHttpRequest();
    xhr.addEventListener('load', requestListener);
    xhr.open('DELETE', apiDeleteUrl);
    xhr.send();
  } else
    return;
  
  function requestListener() {
    window.location.href = '/all/tanzakus.html';
  }
}


function convertUTC(date) {
  let dateTime = new Date(date);
  let locale = 'en-US';
  
  let formatOptions = {
    day:    '2-digit', 
    month:  '2-digit', 
    year:   'numeric',
    hour:   '2-digit', 
    minute: '2-digit',
    hour12: true
  };
  let dateTimeString = dateTime.toLocaleDateString(locale, formatOptions);

  dateTimeString = dateTimeString.replace(',', '');
  
  let MMDDYYYY = dateTimeString.substr(0, 10),
      formattedDate = '';
  let time = dateTimeString.substr(11);

  let objDate = new Date(MMDDYYYY),
      mon = objDate.toLocaleString(locale, {month: 'short'}),
      dd = MMDDYYYY.substr(3, 2),
      yyyy = MMDDYYYY.substr(6, 4);
  
  formattedDate = time + ' - ' + dd + ' ' + mon + ' ' + yyyy;

  return formattedDate;
}


function createCard(title, url, desc, has_been_visited, created_at, id) {
  const cardDiv = document.getElementById('card-div');
  let rootUrl = '';
  
  let formattedTime = convertUTC(created_at);
  
  if (url.length > 52)
    rootUrl = url.substr(0, 50) + '...';
  else
    rootUrl = url;
  
  let card = document.createElement('div');
  card.classList.add('card-body');
  card.classList.add('hidden');
  card.dataset.visited = has_been_visited;

  card.innerHTML = '<div class="card"><header class="card-header"><a href="' + url + '" class="card-header-icon"><span class="icon">🎋</span></a><p class="card-header-title">' + title + '</p></header><div class="card-content"><div class="content"><p>' + desc + '</p><small> <a href="' + url + '" target="_blank">' + rootUrl + '</a> </small> <small> <a class="timestamp">' + formattedTime + '</a> </small></div></div><footer class="card-footer"><a href="' + url + '" target="_blank" class="card-footer-item">View</a><a data-id="' + id + '"class="card-footer-item _delete">Delete</a></footer></div>';
  
  cardDiv.appendChild(card);
}
