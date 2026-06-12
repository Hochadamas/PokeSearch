const TYPE_COLORS = {
  fire: '#ef4444',    water: '#3b82f6',  grass: '#22c55e',
  electric: '#eab308', psychic: '#ec4899', normal: '#6b7280',
  fighting: '#f97316', rock: '#78716c',   ghost: '#8b5cf6',
  dragon: '#6366f1',  dark: '#374151',   steel: '#94a3b8',
  fairy: '#f472b6',   ice: '#22d3ee',    poison: '#a855f7',
  ground: '#d97706',  flying: '#60a5fa', bug: '#84cc16',
};

function createCard(pokemon) {
  const id = pokemon.id;
  const isLiked = getFavs().includes(id);

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <button class="fav-btn ${isLiked ? 'active' : ''}" data-id="${id}">♥</button>
    <img src="${getArtwork(id)}" alt="${pokemon.name}" loading="lazy">
    <div class="card-info">
      <span class="card-num">#${String(id).padStart(3, '0')}</span>
      <h3 class="card-name">${pokemon.displayName}</h3>
      <div class="card-types">
        ${pokemon.types.map(t =>
          `<span class="type-badge" style="background:${TYPE_COLORS[t.type.name] || '#666'}">${t.type.name}</span>`
        ).join('')}
      </div>
    </div>
  `;

  card.addEventListener('click', e => {
    if (e.target.closest('.fav-btn')) return;
    openModal(pokemon);
  });

  card.querySelector('.fav-btn').addEventListener('click', () => toggleFav(id));

  return card;
}

function openModal(pokemon) {
  const overlay = document.getElementById('modalOverlay');
  const body = document.getElementById('modalBody');

  const spritesHTML = [
    pokemon.sprites.front_default,
    pokemon.sprites.back_default,
    pokemon.sprites.front_shiny,
  ]
    .filter(Boolean)
    .map(src => `<img src="${src}" class="sprite" alt="sprite">`)
    .join('');

  const statsHTML = pokemon.stats.map(s => `
    <div class="stat-row">
      <span class="stat-name">${s.stat.name}</span>
      <div class="stat-bar-bg">
        <div class="stat-bar" data-val="${s.base_stat}" style="width:0"></div>
      </div>
      <span class="stat-val">${s.base_stat}</span>
    </div>
  `).join('');

  body.innerHTML = `
    <div class="modal-header">
      <img src="${getArtwork(pokemon.id)}" alt="${pokemon.name}" class="modal-img">
      <div>
        <span class="card-num">#${String(pokemon.id).padStart(3, '0')}</span>
        <h2 class="modal-name">${pokemon.displayName}</h2>
        <div class="card-types" style="margin-top:0.5rem">
          ${pokemon.types.map(t =>
            `<span class="type-badge" style="background:${TYPE_COLORS[t.type.name] || '#666'}">${t.type.name}</span>`
          ).join('')}
        </div>
        <p class="modal-meta">Height: ${pokemon.height / 10} m &nbsp;|&nbsp; Weight: ${pokemon.weight / 10} kg</p>
      </div>
    </div>
    <div class="modal-sprites">${spritesHTML}</div>
    <div class="modal-stats">${statsHTML}</div>
  `;

  overlay.classList.add('open');

  // width starts at 0 in the HTML so the transition actually plays on open
  setTimeout(() => {
    body.querySelectorAll('.stat-bar').forEach(bar => {
      bar.style.width = Math.min((parseInt(bar.dataset.val) / 255) * 100, 100) + '%';
    });
  }, 100);
}

function renderCards(list, container, clearFirst = false) {
  if (clearFirst) container.innerHTML = '';
  list.forEach((pokemon, i) => {
    const card = createCard(pokemon);
    // cap delay so late-loaded batches don't stagger forever
    card.style.animationDelay = `${Math.min(i * 0.05, 0.4)}s`;
    container.appendChild(card);
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── Favorites (localStorage) ──

function getFavs() {
  return JSON.parse(localStorage.getItem('pokeFavs') || '[]');
}

function toggleFav(id) {
  let favs = getFavs();
  favs = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
  localStorage.setItem('pokeFavs', JSON.stringify(favs));

  document.querySelectorAll(`.fav-btn[data-id="${id}"]`).forEach(btn => {
    btn.classList.toggle('active', favs.includes(id));
  });

  renderFavorites();
}

async function renderFavorites() {
  const grid = document.getElementById('favoritesGrid');
  const noFav = document.getElementById('noFav');
  const favs = getFavs();

  grid.innerHTML = '';

  if (!favs.length) {
    noFav.style.display = 'block';
    return;
  }

  noFav.style.display = 'none';
  const pokemons = await Promise.all(favs.map(id => fetchPokemon(id)));
  renderCards(pokemons, grid);
}
