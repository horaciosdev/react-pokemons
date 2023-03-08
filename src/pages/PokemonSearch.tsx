import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

interface IPokemon {
  name: string;
  types: { type: { name: string } }[];
  sprites: { front_default: string };
}

export default function PokemonSearch() {
  const { term } = useParams();
  const [pokemon, setPokemon] = useState<IPokemon | null>(null);

  useEffect(() => {
    async function searchPokemon() {
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${term}`
      );
      setPokemon(response.data);
    }
    searchPokemon();
  }, []);

  return (
    <div>
      {pokemon && (
        <div>
          <h2>{pokemon.name}</h2>
          <img src={pokemon.sprites.front_default} alt={pokemon.name} />
          <p>Type: {pokemon.types[0].type.name}</p>
        </div>
      )}
    </div>
  );
}
