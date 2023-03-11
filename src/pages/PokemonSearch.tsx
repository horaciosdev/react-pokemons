import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

import "../styles/PokemonSearch.css";
import Carousel from "../components/Carousel";
import { FaArrowRight } from "react-icons/fa";

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

interface ICard {
  id: string;
  name: string;
  imageUrl: string;
  imageUrlHiRes: string;
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
  const [cards, setCards] = useState<ICard[] | null>(null);
  const [images, setImages] = useState<string[]>([]);

  const glare = getRandomGlareBackground(20);

  useEffect(() => {
    async function searchPokemon() {
      if (term) {
        const response = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${term}`
        );

        // Load Chain
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

  useEffect(() => {
    async function loadCards() {
      if (pokemon) {
        // Load Cards
        const responseCards = await axios.get(
          `https://api.pokemontcg.io/v1/cards?name=${pokemon.name
            .trim()
            .toLocaleLowerCase()}`
        );

        setCards(responseCards.data.cards);

        let imagesArr: string[] = [];
        if (responseCards.data.cards) {
          responseCards.data.cards.forEach((card: ICard) => {
            imagesArr = [...imagesArr, card.imageUrl];
          });
          setImages(imagesArr);
        }
      }
    }

    loadCards();
  }, [pokemon]);

  return (
    <div>
      {pokemon && (
        <div>
          <header className="pokemon-search-header">
            <img src={pokemon.sprites.front_default} alt={pokemon.name} />
            <h1 className="pokemon-title-name">{pokemon.name}</h1>
          </header>

          <div className="cards-carousel">
            <h1>Cards</h1>
            <Carousel images={images} />
          </div>
          {/* <div className="cards-container">
            {cards &&
              cards.map((card) => (
                <div className="card">
                  <img key={card.id} src={card.imageUrl} alt={card.name} />
                </div>
              ))}
          </div> */}

          {/* <div className="pokemon-card">
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
          </div> */}

          <div className="pokemon-evolution">
            <h1>Evolution</h1>
            <div className="pokemon-chain">
              {pokemonChain &&
                pokemonChain.map((pokechain, index) => (
                  <div key={index} className="pokemon-images">
                    <div>
                      <img src={pokechain.src} alt={pokechain.name} />
                      <h1 className="chain-pokemon-name">{pokechain.name}</h1>
                    </div>
                    {index < pokemonChain.length - 1 && (
                      <div className="evolution-arrow">
                        <FaArrowRight />
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
