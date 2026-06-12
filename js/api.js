const API_BASE = 'https://pokeapi.co/api/v2';

async function fetchPokemonList(limit, offset) {
  const res = await fetch(`${API_BASE}/pokemon?limit=${limit}&offset=${offset}`);
  const data = await res.json();
  return data.results;
}

async function fetchPokemon(nameOrId) {
  const [pokemonRes, speciesRes] = await Promise.all([
    fetch(`${API_BASE}/pokemon/${nameOrId}`),
    fetch(`${API_BASE}/pokemon-species/${nameOrId}`),
  ]);
  const pokemon = await pokemonRes.json();

  // species can 404 for alternate forms — degrade gracefully instead of crashing
  if (!speciesRes.ok) {
    console.warn('species fetch failed for', nameOrId, speciesRes.status);
    pokemon.displayName = pokemon.name;
    return pokemon;
  }

  const species = await speciesRes.json();
  const enEntry = species.names.find(n => n.language.name === 'en');
  // raw pokemon.name is a lowercase slug (e.g. "mr-mime"), enEntry gives the proper title case
  pokemon.displayName = enEntry ? enEntry.name : pokemon.name;
  return pokemon;
}

function getArtwork(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}
