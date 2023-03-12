import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import pokelogo from "../assets/images/pokelogo.png";
import "../styles/Pokemon.css";
import Carousel from "../components/Carousel";

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
  description: string;
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
  let trasparence = Math.random() * 10 + 5;

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

export default function Pokemon() {
  const navigate = useNavigate();
  const { term } = useParams();
  const [pokemon, setPokemon] = useState<IPokemon | null>(null);
  const [pokemonChain, setPokemonChain] = useState<IChain[] | null>(null);
  const [cards, setCards] = useState<ICard[] | null>(null);
  const [images, setImages] = useState<string[]>([]);

  const glare = getRandomGlareBackground(20);

  useEffect(() => {
    async function searchPokemon() {
      setPokemon(null);
      if (!term) {
        navigate("/pokemons/");
      }
      if (term) {
        const response = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${term.trim().toLocaleLowerCase()}`
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

        // Load description
        const descriptionResponse = await axios.get(
          `https://pokeapi.co/api/v2/pokemon-species/${term
            .trim()
            .toLocaleLowerCase()}`
        );
        const description = descriptionResponse.data.flavor_text_entries.find(
          (entry: { language: { name: string }; version: { url: string } }) =>
            entry.language.name === "en" &&
            entry.version.url === "https://pokeapi.co/api/v2/version/23/"
        ).flavor_text;
        console.log(description);

        let newPokemon: IPokemon = response.data;
        newPokemon.description = description;

        setPokemon(newPokemon);
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
    <>
      <div>
        {!pokemon && (
          <div className="poke-loading">
            <img src={pokelogo} alt="loading image" />
          </div>
        )}
      </div>
      {pokemon && (
        <div>
          <header
            className={`pokemon-search-header type_${pokemon.types[0].type.name}`}
          >
            <img src={pokemon.sprites.front_default} alt={pokemon.name} />
            <div className="pokemon-title">
              <h1 className="pokemon-title-name">{pokemon.name}</h1>
              {pokemon.types.map((type, index) => (
                <div key={index}>{type.type.name}</div>
              ))}
            </div>
            <img src={pokemon.sprites.front_default} alt={pokemon.name} />
          </header>

          <div className="pokemon-card-container">
            <div
              className={`pokemon-card type_gradient_${pokemon.types[0].type.name}`}
            >
              <div className="card-content">
                <img
                  className="pokemon-card-image"
                  src={pokemon.sprites.other["official-artwork"].front_default}
                  alt={pokemon.name}
                />
                <span>{pokemon.description}</span>
              </div>
            </div>
          </div>

          <div className="pokemon-evolution">
            <h1>Evolution</h1>
            <div className="pokemon-chain">
              {pokemonChain &&
                pokemonChain.map((pokechain, index) => (
                  <div key={index} className="pokemon-evo-card-container">
                    <div className="pokemon-evo-card">
                      <img
                        className="pokemon-evo-image"
                        src={pokechain.src}
                        alt={pokechain.name}
                      />
                      <h1 className="pokemon-evo-name">{pokechain.name}</h1>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="cards-carousel">
            <h1>Cards</h1>
            <Carousel images={images} />
          </div>
        </div>
      )}
    </>
  );
}
