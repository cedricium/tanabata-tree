function createModal(modalTitle, modalMessage, has_footer, id) {
  const modalDiv = document.createElement('div');
  modalDiv.classList.add('modal');
  
  if (has_footer) {
    modalDiv.innerHTML = '<div class="modal-background"></div><div class="modal-card"><header class="modal-card-head"><p class="modal-card-title">' + modalTitle + '</p><button class="delete"></button></header><section class="modal-card-body"><div class="content is-medium"><p>' + modalMessage + '</p><small>Note: This action cannot be undone.</small></section><footer class="modal-card-foot"><button id="remove" class="button is-danger">Delete</button><button id="cancel" class="button">Cancel</button></footer></div>';
  } else {
    modalDiv.innerHTML = '<div class="modal-background"></div><div class="modal-card"><header class="modal-card-head"><p class="modal-card-title">Something went wrong! &#128557;</p><button class="delete"></button></header><section class="modal-card-body"><div class="content is-medium"><p>' + modalMessage + '</p></section></div>';
  }
  
  modalDiv.classList.add('is-active');
  document.body.appendChild(modalDiv);
  
  modalDiv.querySelector('.modal-background').addEventListener('click', (event) => {
    event.preventDefault();
    modalDiv.classList.remove('is-active');
    continueDeletion(false, id);
  });
  
  modalDiv.querySelector('.delete').addEventListener('click', (event) => {
    event.preventDefault();
    modalDiv.classList.remove('is-active');
    continueDeletion(false, id);
  });
  
  modalDiv.querySelector('#remove').addEventListener('click', () => {
    modalDiv.classList.remove('is-active');
    continueDeletion(true, id);
  });
  
  modalDiv.querySelector('#cancel').addEventListener('click', () => {
    modalDiv.classList.remove('is-active');
    continueDeletion(false, id);
  });
}