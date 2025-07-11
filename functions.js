let currentDeck = '';
let allDecks = [];

try {
  allDecks = JSON.parse(localStorage.getItem('deckList')) || ['My Gundam Deck'];
} catch {
  allDecks = ['My Gundam Deck'];
}

// Switch between deck and card tabs, rendering/updating as needed
function switchTab(id) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
  document.querySelector(`.tab[onclick*='${id}']`).classList.add('active');
  document.getElementById(id).classList.add('active');
  if (id === 'deckView') renderDeckList();
  if (id === 'cardView') updateDeckSelector();
}

// Render list of decks in sidebar
function renderDeckList() {
  const list = document.getElementById('deckList');
  list.innerHTML = '';
  allDecks.forEach(name => {
    const div = document.createElement('div');
    div.className = 'deck-entry';
    div.textContent = name;
    div.onclick = () => openDeck(name);
    list.appendChild(div);
  });
}

// Create a new deck after validation
function createDeck() {
  const nameInput = document.getElementById('newDeckName');
  const name = nameInput.value.trim();

  if (!name) {
    alert('Deck name cannot be empty.');
    return;
  }

  if (allDecks.includes(name)) {
    alert('A deck with this name already exists.');
    return;
  }

  allDecks.push(name);
  localStorage.setItem('deckList', JSON.stringify(allDecks));
  localStorage.setItem(name, JSON.stringify([]));

  nameInput.value = ''; // Clear input
  renderDeckList();
  updateDeckSelector();
}

// Toggle inline deck rename input visibility
function toggleRenameInput() {
  const renameInput = document.getElementById('renameInput');
  if (renameInput.style.display === 'inline-block') {
    renameInput.style.display = 'none';
  } else {
    renameInput.style.display = 'inline-block';
    renameInput.value = currentDeck;
    renameInput.focus();
  }
}

// Rename the current deck with validations
function renameDeck() {
  const newName = document.getElementById('renameInput').value.trim();
  if (!newName || newName === currentDeck || allDecks.includes(newName)) {
    alert('Invalid or duplicate deck name.');
    return;
  }
  const cards = JSON.parse(localStorage.getItem(currentDeck)) || [];
  localStorage.setItem(newName, JSON.stringify(cards));
  localStorage.removeItem(currentDeck);

  allDecks[allDecks.indexOf(currentDeck)] = newName;
  localStorage.setItem('deckList', JSON.stringify(allDecks));

  currentDeck = newName;
  document.getElementById('deckTitle').innerText = newName;
  renderDeckList();
  updateDeckSelector();
  toggleRenameInput();
}

// Populate deck selector dropdown
function updateDeckSelector() {
  const selector = document.getElementById('deckSelector');
  selector.innerHTML = '';
  allDecks.forEach(deck => {
    const option = document.createElement('option');
    option.value = deck;
    option.textContent = deck;
    selector.appendChild(option);
  });
}

// Open and display deck contents
function openDeck(name) {
  currentDeck = name;
  document.getElementById('deckTitle').innerText = name;
  document.getElementById('deckContents').style.display = 'block';
  document.getElementById('renameInput').style.display = 'none';

  const savedCardNames = JSON.parse(localStorage.getItem(currentDeck)) || [];
  const deckCards = document.getElementById('deckCards');
  deckCards.innerHTML = '';

  savedCardNames.forEach(cardName => {
    const card = findCardByName(cardName);
    if (!card) return;

    const entry = document.createElement('div');
    entry.className = 'card-entry';
    entry.textContent = card.name;
    entry.onclick = () => showFullCard(card.name, card.effect, card.setEffect, card.setNo, card.imgSrc, false);
    deckCards.appendChild(entry);
  });
}

function findCardByName(name) {
  for (const booster of cardsData) {
    for (const card of booster.cards) {
      if (card.name === name) return card;
    }
  }
  return null;
}

// Show full card preview modal
function showFullCard(name, effect, setEffect, setNo, imgSrc, canAdd) {
  document.getElementById('previewName').innerText = name;
  document.getElementById('previewEffect').innerText = effect;
  document.getElementById('previewSet').innerText = setEffect;
  document.getElementById('previewSetNo').innerText = setNo;
  document.getElementById('previewImg').src = imgSrc;
  document.getElementById('cardPreviewFull').style.display = 'block';

  const addBtn = document.getElementById('addBtn');
  if (canAdd) {
    addBtn.style.display = 'inline-block';
    addBtn.dataset.card = JSON.stringify({ name, setNo, effect, setEffect, imgSrc });
  } else {
    addBtn.style.display = 'none';
    addBtn.removeAttribute('data-card');
  }
}

// Close card preview modal
function closeFullPreview() {
  document.getElementById('cardPreviewFull').style.display = 'none';
}

// Add card to selected deck or current deck
function addToCurrentDeck(fromCardsTab = false) {
  const card = JSON.parse(document.getElementById('addBtn').dataset.card);
  const targetDeck = fromCardsTab ? document.getElementById('deckSelector').value : currentDeck;

  if (!targetDeck) {
    alert('Please select or open a deck first.');
    return;
  }

  let deck = [];
  try {
    deck = JSON.parse(localStorage.getItem(targetDeck)) || [];
  } catch {
    deck = [];
  }

  // Only store the card name
  deck.push(card.name);
  localStorage.setItem(targetDeck, JSON.stringify(deck));
  closeFullPreview();

  if (!fromCardsTab && targetDeck === currentDeck) openDeck(currentDeck);
}

// Toggle booster card list visibility
function toggleBooster(el) {
  const cardsDiv = el.querySelector('.booster-cards');
  if (!cardsDiv) return;
  cardsDiv.style.display = cardsDiv.style.display === 'block' ? 'none' : 'block';
}

// Delete current deck with confirmation
function deleteDeck() {
  if (!currentDeck) return;

  const confirmed = confirm(`Are you sure you want to delete "${currentDeck}"?`);
  if (!confirmed) return;

  localStorage.removeItem(currentDeck);

  allDecks = allDecks.filter(deck => deck !== currentDeck);
  localStorage.setItem('deckList', JSON.stringify(allDecks));

  currentDeck = '';
  document.getElementById('deckContents').style.display = 'none';
  renderDeckList();
  updateDeckSelector();
}

document.addEventListener('DOMContentLoaded', () => {
  renderDeckList();
  updateDeckSelector();

  const renameInput = document.getElementById('renameInput');
  renameInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') renameDeck();
    if (e.key === 'Escape') toggleRenameInput();
  });
});

function toggleBooster(el) {
  const cardsDiv = el.querySelector('.booster-cards');
  if (!cardsDiv) return;
  cardsDiv.style.display = cardsDiv.style.display === 'block' ? 'none' : 'block';
}

function renderBoosterSets() {
  const container = document.getElementById('boosterSetsContainer');
  container.innerHTML = ''; // Clear previous content

  cardsData.forEach(booster => {
    const boosterDiv = document.createElement('div');
    boosterDiv.className = 'booster-set';
    boosterDiv.style.cursor = 'pointer';

    // Booster header with toggle
    const header = document.createElement('strong');
    header.textContent = booster.boosterName;
    boosterDiv.appendChild(header);

    // Cards container hidden by default
    const cardsDiv = document.createElement('div');
    cardsDiv.className = 'booster-cards mt-2';
    cardsDiv.style.display = 'none';

    booster.cards.forEach(card => {
      const cardEntry = document.createElement('div');
      cardEntry.className = 'card-entry';
      cardEntry.textContent = card.name;
      cardEntry.onclick = () => showFullCard(card.name, card.effect, card.setEffect, card.setNo, card.imgSrc, true);
      cardsDiv.appendChild(cardEntry);
    });

    boosterDiv.appendChild(cardsDiv);

    // Toggle cards on clicking booster name
    boosterDiv.onclick = (e) => {
      if (e.target === boosterDiv || e.target === header) {
        toggleBooster(boosterDiv);
      }
    };

    container.appendChild(boosterDiv);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderBoosterSets();
});


