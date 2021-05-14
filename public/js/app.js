function localStorge(localStorage = window.localStorage) {
  const STORAGE_STRING = 'agify';

  const loadAges = () => {
    const storage = localStorage.getItem(STORAGE_STRING);

    let list = [];

    try {
      list = JSON.parse(storage);
    } catch (error) {
      console.error('Error parsing ages from storage', error);
      list = [];
    }

    if (Array.isArray(list)) {
      return list;
    }
    return [];
  }

  function addAge(age) {
    const list = loadAges();
    list.push(age);
    const lastNine = list.slice(-9);
    localStorage.setItem(STORAGE_STRING, JSON.stringify(lastNine));
  }

  function removeAge(index) {
    const currentList = loadAges();
    currentList.splice(index, 1);
    localStorage.setItem(STORAGE_STRING, JSON.stringify(currentList));
  }

  return {
    loadAges,
    addAge,
    removeAge
  };
}

function search(buttonId, inputId, ageForm, onSearch) {
  const button = document.getElementById(buttonId);
  const input = document.getElementById(inputId);
  const form = document.getElementById(ageForm);

  const handleSearch = event => {
    event.preventDefault();
    const name = input.value;
    if (!name) {
      throw new Error('A name is required');
    }

    if (typeof onSearch === 'function') {
      onSearch(name);
    }
    input.value = '';
  };
  button.addEventListener('click', handleSearch);
  form.addEventListener('submit', handleSearch);
}

function nameSearch(name) {
  return fetch(`https://api.agify.io?name=${name}`)
    .then(response => response.json())
    .catch(error => console.error('Error', error));
}

function render(item, index) {
  return `
 <div class="age">
    <div class="flex col space-between rectangle">
      <div class="flex space-between">
        <span class="name-item">${item.name}</span>
        <span class="close-item" data-index="${index}">X</span>
      </div>
      <div class="age-item flex center">${item.age}</div>
      <div class="age-item-count flex center">
        <span class="count-item">Sample Size ${item.count}
      </div>
    </div>
  </div>
  `;
}

function renderAges(storage) {
  const agesArray = storage.loadAges();

  if (!Array.isArray(agesArray)) {
    console.error('tried to render something thats not an array');
    return;
  }

  const element = document.getElementById('container');
  if (!element) {
    return;
  }
  const data = agesArray.map((item, index) => render(item, index)).join('');
  element.innerHTML = `<div class="flex row list">${data}</div>`;

  const closeButton = document.getElementsByClassName('close-item');
  for (let i = 0; closeButton.length; i++) {
    const close = closeButton.item(i);
    console.log('close', closeButton.item)
    const onRemove = event => {
      const indexToRemove = parseInt(event.target.dataset.index, 10);
      storage.removeAge(indexToRemove);
      close.removeEventListener('click', onRemove);
      renderAges(storage);
      console.log('close 1', close);
    };
    console.log('close 2', close);
    close.removeEventListener('click', onRemove());
  }
}

search('button', 'nameInput', 'ageForm', nameToSearch => {
  nameSearch(nameToSearch)
    .then(age => {
      storage.addAge(age);
      renderAges(storage);
    })
    .catch(error => console.error('Search error', error));
});
const storage = localStorge(window.localStorage);
renderAges(storage);
