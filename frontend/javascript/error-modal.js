function createModal(message) {
  const modalDiv = document.createElement('div');
  modalDiv.classList.add('modal');
  
//  modalDiv.innerHTML = '<div class="modal-background"></div><div class="modal-content">This is some text!</div><button class="modal-close is-large"></button>';
  
  modalDiv.innerHTML = '<div class="modal-background"></div><div class="modal-card"><header class="modal-card-head"><p class="modal-card-title">Something went wrong! &#128557;</p><button class="delete"></button></header><section class="modal-card-body"><div class="content is-medium"><p>' + message + '</p></section></div>';
  
  modalDiv.classList.add('is-active');
  document.body.appendChild(modalDiv);
  
  modalDiv.querySelector('.modal-background').addEventListener('click', (event) => {
    event.preventDefault();
    modalDiv.classList.remove('is-active');
    html.classList.remove('is-clipped');
  });
  
  modalDiv.querySelector('.delete').addEventListener('click', (event) => {
    event.preventDefault();
    modalDiv.classList.remove('is-active');
    html.classList.remove('is-clipped');
  });
}