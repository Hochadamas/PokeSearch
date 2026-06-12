let offset = 0;
const LIMIT = 20;
let allLoaded = [];
let activeType = 'all';

const grid = document.getElementById('pokemonGrid');
const searchInput = document.getElementById('searchInput');

async function loadMore() {
  document.getElementById('loadMore').disabled = true;
  const list = await fetchPokemonList(LIMIT, offset);
  const pokemons = await Promise.all(list.map(p => fetchPokemon(p.name)));
  allLoaded.push(...pokemons);
  offset += LIMIT;
  applyFilters();
  document.getElementById('loadMore').disabled = false;
}

function applyFilters() {
  const query = searchInput.value.toLowerCase().trim();
  const filtered = allLoaded.filter(p => {
    const nameMatch = p.name.includes(query);
    const typeMatch = activeType === 'all' || p.types.some(t => t.type.name === activeType);
    return nameMatch && typeMatch;
  });
  renderCards(filtered, grid, true);
}

function buildTypeFilters() {
  const types = ['all', 'fire', 'water', 'grass', 'electric', 'psychic', 'normal', 'ghost', 'dragon', 'dark'];
  const container = document.getElementById('typeFilters');

  types.forEach(type => {
    const btn = document.createElement('button');
    btn.className = 'type-filter-btn' + (type === 'all' ? ' active' : '');
    btn.textContent = type === 'all' ? 'All' : type;
    if (TYPE_COLORS[type]) btn.style.setProperty('--type-color', TYPE_COLORS[type]);

    btn.addEventListener('click', () => {
      activeType = type;
      document.querySelectorAll('.type-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });

    container.appendChild(btn);
  });
}

// ── Events ──

document.getElementById('burger').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

document.getElementById('modalClose').addEventListener('click', () => {
  document.getElementById('modalOverlay').classList.remove('open');
});

// close modal when clicking the backdrop
document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target.id === 'modalOverlay') {
    document.getElementById('modalOverlay').classList.remove('open');
  }
});

searchInput.addEventListener('input', applyFilters);

document.getElementById('loadMore').addEventListener('click', loadMore);

// ── Init ──
buildTypeFilters();
loadMore();
renderFavorites();
