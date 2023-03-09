import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

import "../styles/PokemonSearch.css";

interface IPokemon {
  name: string;
  types: { type: { name: string } }[];
  sprites: {
    front_default: string;
    other: {
      home: { front_default: string };
      dream_world: { front_default: string };
      "official-artwork": { front_default: string };
    };
  };
}

interface IChain {
  name: string;
  src: string;
}

function getRandomGlareBackground(qtd: number) {
  let posx = Math.random() * 100;
  let posy = Math.random() * 100;
  let size = Math.random() + 1;
  let trasparence = Math.random() * 10 + 3;

  if (qtd > 0) {
    let radial = `radial-gradient(circle at ${posx}% ${posy}%, rgba(255,255,255,.5) ${size}%, transparent ${trasparence}%)`;
    while (qtd) {
      qtd--;
      posx = Math.random() * 100;
      posy = Math.random() * 100;
      size = Math.random() + 0.5;
      trasparence = Math.random() * 7 + 3;
      radial += `, radial-gradient(circle at ${posx}% ${posy}%, rgba(255,255,255,.5) ${size}%, transparent ${trasparence}%)`;
    }
    return radial;
  }
}

export default function PokemonSearch() {
  const { term } = useParams();
  const [pokemon, setPokemon] = useState<IPokemon | null>(null);
  const [pokemonChain, setPokemonChain] = useState<IChain[] | null>(null);

  const glare = getRandomGlareBackground(20);

  useEffect(() => {
    async function searchPokemon() {
      if (term) {
        const response = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${term}`
        );
        const speciesUrl = response.data.species.url;
        const speciesResponse = await axios.get(speciesUrl);
        const evolutionChainUrl = speciesResponse.data.evolution_chain.url;
        const evolutionChainResponse = await axios.get(evolutionChainUrl);
        let chain = evolutionChainResponse.data.chain;

        let url = chain.species.url;
        let segments = url.split("/");
        let id = segments[segments.length - 2];

        let newPokemonChain = [
          {
            name: chain.species.name,
            src: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
          },
        ];

        while (chain.evolves_to.length > 0) {
          const evolvesTo = chain.evolves_to[0];

          url = evolvesTo.species.url;
          segments = url.split("/");
          id = segments[segments.length - 2];

          newPokemonChain = [
            ...newPokemonChain,
            {
              name: evolvesTo.species.name,
              src: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
            },
          ];
          chain = evolvesTo;
        }

        setPokemon(response.data);
        setPokemonChain(newPokemonChain);
      }
    }
    searchPokemon();
  }, [term]);

  return (
    <div>
      {pokemon && (
        <div>
          <div className="pokemon-card">
            <div
              className={`card-content type_${pokemon.types[0].type.name}`}
              style={{
                backgroundImage: glare,
              }}
            >
              <h2 className="pokemon-name">{pokemon.name}</h2>
              <div className="pokemon-image">
                <img
                  src={pokemon.sprites.other["official-artwork"].front_default}
                  alt={pokemon.name}
                />
                <p>Type: {pokemon.types[0].type.name}</p>
              </div>
            </div>
          </div>

          <div className="pokemon-chain">
            {pokemonChain &&
              pokemonChain.map((pokechain) => (
                <div>
                  <h2>{pokechain.name}</h2>

                  <div className="pokemon-images">
                    <img src={pokechain.src} alt={pokechain.name} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
