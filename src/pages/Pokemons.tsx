import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import pokelogo from "../assets/images/pokelogo.png";

export interface IResult {
  count: number;
  next?: string;
  previous?: string;
  results: { name: string; url: string }[];
}

import "../styles/Pokemons.css";

export default function Pokemons() {
  const [result, setResult] = useState<IResult | null>(null);

  useEffect(() => {
    setResult(null);
    const maxPokemons = 150;
    const api = "https://pokeapi.co/api/v2/pokemon/";
    const url = `${api}?limit=${maxPokemons}`;

    async function loadPokemons() {
      const pokemonsResponse = await axios.get(url);

      setResult(pokemonsResponse.data);
    }

    loadPokemons();
  }, []);

  async function handleNextPage() {
    if (result?.next) {
      setResult(null);
      const pokemonsResponse = await axios.get(result.next);

      setResult(pokemonsResponse.data);
    }
  }
  async function handlePreviousPage() {
    if (result?.previous) {
      setResult(null);
      const pokemonsResponse = await axios.get(result.previous);

      setResult(pokemonsResponse.data);
    }
  }

  return (
    <div className="pokemons">
      <h1 className="pokemons-title">Pokemons</h1>
      <div>
        {!result && (
          <div className="poke-loading">
            <img src={pokelogo} alt="loading image" />
          </div>
        )}
      </div>
      <div className="pokemons-container">
        {result &&
          result.results.map((pokemon, index) => (
            <Link
              key={index}
              to={`/pokemon/${pokemon.name}`}
              className="pokemon-name-link"
            >
              <div className="pokemon-mini-card">
                <div className="pokemon-mini-card-image">
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.url
                      .split("/")
                      .slice(-2, -1)}.png`}
                    alt={pokemon.name}
                  />
                </div>
                <div className="pokemon-mini-card-name">
                  {pokemon.url
                    .split("/")
                    .slice(-2, -1)
                    .toString()
                    .padStart(4, "0")}
                </div>
                <div className="pokemon-mini-card-name">{pokemon.name}</div>
              </div>
            </Link>
          ))}
      </div>
      <div className="pagination-container">
        {result?.previous && (
          <button className="pokemon-previous-btn" onClick={handlePreviousPage}>
            PREV
          </button>
        )}
        {result?.next && (
          <button className="pokemon-next-btn" onClick={handleNextPage}>
            NEXT
          </button>
        )}
      </div>
    </div>
  );
}
