const LOAD_TANZAKUS_AMOUNT = 5;
let currentTanzakuFilter = '';
let cards = document.getElementsByClassName('card-body');


/**
 * Function called when page DOM content has been loaded (on redirect to current page or refresh).
 * Makes a GET request to the server for all tanzakus and creates the cards based on the response.
 * @param None
 */
document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  loader.classList.remove('hidden');

  currentTanzakuFilter = 'all';
  document.getElementsByClassName('filter')[0].classList.add('is-active');

  const versionEl = document.getElementById('version');
  let version = versionEl.textContent;
  versionEl.href = 'https://www.github.com/cedricium/tanabata-tree/releases/tag/' + version;
  
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

    const searchbar = document.getElementById('searchbar');
    searchbar.addEventListener('keyup', automaticSearching);

    loader.classList.add('hidden');
    
    let deleteBtns = document.getElementsByClassName('_delete');
    for (var i = 0; i < deleteBtns.length; i++)
      deleteBtns[i].addEventListener('click', deleteTanzaku);
  }
});


/**
 * Function used to update the database for a given tanzaku's `has_been_visited` value.
 * @param {event} e - Event when tanzaku 'View' button clicked
 */
function updateTanzaku(e) {
  let visited = e.target.parentElement.parentElement.parentElement.dataset.visited;
  let id = e.target.parentElement.dataset.id;

  let apiUpdateTanzaku = '../api/v1/tanzakus/' + id

  if (visited !== true) {
    let xhr = new XMLHttpRequest();
    xhr.open('PUT', apiUpdateTanzaku);
    xhr.onload = function () {
      window.location.href = '/all/tanzakus.html';
    }
    xhr.send();
  } else
    return;
}

/**
 * Function used to initiate process of deleting tanzaku from database by
 * creating a confirmation modal.
 * @param None
 */
function deleteTanzaku() {
  let id = this.getAttribute('data-id');
  
  // confirm deletion of tanzaku
  let deleteTitle = 'Finished with this tanzaku?';
  let deleteMessage = 'Are you sure you want to delete this tanzaku?';
  
  createModal(deleteTitle, deleteMessage, true, id);
}

/**
 * Function to finish process of permanently deleting tanzaku from database.
 * @param {Boolean} should_delete - Boolean value whether to delete tanzaku (true) or not (false).
 * @param {string} id - UUID of given tanzaku to delete.
 */
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


/**
 * Function called when `onkeyup` is fired inside the `#searchbar` element. Begins
 * process of searching tanzakus by creating a new timeout.
 * @param None
 */
let timeout = null;

function automaticSearching() {
  const minValue = 3;
  let searchValue = searchbar.value;
  clearTimeout(timeout);
  
  timeout = setTimeout(function() {
    search(searchValue, currentTanzakuFilter);
  }, 800);
}

/**
 * Function searches through the current non-hidden tanzakus for the given `query`. Checks against
 * the tanzakus title, description, and url. If a match is not found, tanzakus are hidden.
 * @param {string} query - String to be matched against when searching through tanzakus.
 * @param {string} filter - OPTIONAL (should delete)
 */
function search(query, filter) {
  filterTanzakus(currentTanzakuFilter);
  query = query.toLowerCase();
  let cards = document.querySelectorAll('.card-body:not(.hidden)');
  let numTanzakusFound = cards.length;

  try {
    for (let i = 0; i < cards.length; i++) {
      if (!cards[i].dataset.title.toLowerCase().includes(query) &&
      !cards[i].dataset.desc.toLowerCase().includes(query) &&
      !cards[i].dataset.url.toLowerCase().includes(query)) {
        cards[i].classList.add('hidden');
        numTanzakusFound--;
      }
    }
    if (numTanzakusFound === 0)
      toggleNotFound(false);
  } catch (e) {
  	console.error(e);
  }
}

/**
 * Function used to toggle the visibility of the `div class="no-tanzakus-found">` element.
 * Is set visible when filtering tanzakus and no tanzakus match current filter, hidden elsewise.
 * @param {Boolean} should_hide - True if `div class="no-tanzakus-found">` element should be
 *                                hidden, false if otherwise (when filtering and no tanzakus are found).
 */
function toggleNotFound(should_hide) {
  notFoundDiv = document.querySelector('.no-tanzakus-found');
  
  if (should_hide)
    notFoundDiv.classList.add('hidden');
  else
    notFoundDiv.classList.remove('hidden');
} 

/**
 * Helper function that scrolls to the top of the page. Typically called when page has been
 * scrolled and a filter or search occurs (used to 'reset' the page).
 * @param None
 */
function scrollToTop() {
  window.scrollTo(0, 0);
}

/**
 * Function called to reset the filters panel. Callback function for the 'reset all filters' button.
 * @param None
 */
function resetFilters() {
  searchbar.value = '';
  activateFilter('all');
  scrollToTop();
}

/**
 * Function used to set the current filter to the corresponding filter button which was clicked.
 * Callback function for each of the three filter buttons in the filter panel.
 * @param {string} filter - Filter to be set to. Options: 'all', 'new', or 'archived'.
 */
function activateFilter(filter) {
  searchbar.value = '';
  let currentFilter = currentTanzakuFilter;

  if (currentFilter !== filter) {
    document.querySelector('.filter.is-active').classList.remove('is-active');
    switch (filter) {
      case 'all':
        document.querySelector('a[data-filter="all"]').classList.add('is-active');
        break;
      case 'new':
        document.querySelector('a[data-filter="new"]').classList.add('is-active');
        break;
      case 'archived':
        document.querySelector('a[data-filter="archived"]').classList.add('is-active');
        break;
    }
  }
  currentTanzakuFilter = filter;
  scrollToTop();
  filterTanzakus(currentTanzakuFilter);
}

/**
 * Function used to set the visibility of the tanzakus based on the given `filter`.
 * @param {string} filter - Filter to be set to. Options: 'all', 'new', or 'archived'. Maps out
 *                          to whether the tanzakus' corresponding `has_been_visited` value
 *                          (true - 'archived'; false - 'new'). The 'all' filter means all tanzakus
 *                           will be shown (`has_been_visited` indifferent).
 */
function filterTanzakus(filter) {
  unhideTanzakus();
  toggleNotFound(true);

  let filtered_category;
  switch (filter) {
    case 'new':
      filtered_category = 'false';
      break;
    case 'archived':
      filtered_category = 'true';
      break;
    default: // includes 'all' filter
      return;
  }

  for (let i = 0; i < cards.length; i++) {
    if (cards[i].dataset.visited !== filtered_category)
      cards[i].classList.add('hidden');
  }
}

/**
 * Function used to unhide (removes `hidden` class) from currently hidden tanzakus. Used to
 * return to original state of all tanzakus displayed.
 * @param None
 */
function unhideTanzakus() {
  let cards = document.querySelectorAll('.card-body.hidden');
  for (let i = 0; i < cards.length; i++)
    cards[i].classList.remove('hidden');
}


/**
 * Function used to format date provided by the database (UTC) to a readable format
 * that is found on the tanzakus.
 * @param {string} date - UTC date attached to the `created_at` value for each tanzaku.
 * @returns {string} - formatted time and date in the 'HH:MM AM/PM - DD Mon YYYY' format.
 */
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


/**
 * Function used to turn JSON response from the server (`GET api/v1/tanzakus`) into
 * Bulma-styled cards ('tanzakus').
 * @param {string} title - Title for the tanzaku.
 * @param {string} url - URL the tanzaku directs to.
 * @param {string} desc - Description of the tanzaku.
 * @param {string} has_been_visited - String representation of a Boolean: 'true' if has been
 *                                    visited before, 'false' if not.
 * @param {string} created_at - Date and time the tanzaku was created.
 * @param {string} id - UUID assigned by the server when the tanzaku was created.
 */
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
  // card.classList.add('hidden');
  card.dataset.title = title;
  card.dataset.url = url;
  card.dataset.desc = desc;
  card.dataset.visited = has_been_visited;

  card.innerHTML = '<div class="card"><header class="card-header"><a href="' + url + '" class="card-header-icon" target="_blank"><span class="icon">🎋</span></a><p class="card-header-title">' + title + '</p></header><div class="card-content"><div class="content"><p>' + desc + '</p><small> <a href="' + url + '" target="_blank">' + rootUrl + '</a> </small> <small> <a class="timestamp">' + formattedTime + '</a> </small></div></div><footer class="card-footer" data-id="' + id + '"><a href="' + url + '" target="_blank" class="card-footer-item" onclick="updateTanzaku(event)">View</a><a data-id="' + id + '" class="card-footer-item _delete">Delete</a></footer></div>';
  
  cardDiv.appendChild(card);
}
