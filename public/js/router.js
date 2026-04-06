const urlParams = new URLSearchParams(window.location.search);
const salaParam = urlParams.get('sala');

if (salaParam) {
  window.currentRoom = salaParam;
}
