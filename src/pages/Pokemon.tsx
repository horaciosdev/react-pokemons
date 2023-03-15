import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate, useParams } from "react-router-dom";
import questionMark from "../assets/images/question-mark.png";

import "../styles/Pokemon.css";
import Carousel from "../components/Carousel";
import Loading from "../components/Loading";

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
  const [cardImages, setCardImages] = useState<string[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [responseError, setResponseError] = useState<any | null>(null);

  const glare = getRandomGlareBackground(20);

  useEffect(() => {
    setResponseError(null);
    setPokemon(null);

    async function searchPokemon() {
      if (!term) {
        navigate("/pokemons/");
        return;
      }

      setPokemon(null);
      setPokemonChain(null);
      setCardImages([]);

      try {
        const response = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${term.trim().toLocaleLowerCase()}`
        );
        let newPokemon: IPokemon = response.data;

        try {
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

          newPokemon.description = description;
        } catch (error: any) {
          //newPokemon.description = `Description ${error}`;
          newPokemon.description = "";
        }

        setPokemon(newPokemon);
        searchChain(response);
      } catch (error: any) {
        setNotFound(true);
        setResponseError(error);
      }
    }

    async function searchChain(response: any) {
      if (response) {
        try {
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

          setPokemonChain(newPokemonChain);
        } catch (error: any) {
          //catch here
        }
      }
    }

    searchPokemon();
  }, [term]);

  useEffect(() => {
    async function loadCards() {
      if (pokemon) {
        try {
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
              //imagesArr = [...imagesArr, card.imageUrl];
              imagesArr = [...imagesArr, card.imageUrlHiRes];
            });
            setCardImages(imagesArr);
          }
        } catch (error) {
          // catch
        }
      }
    }

    loadCards();
  }, [pokemon]);

  return (
    <>
      {!pokemon && !responseError && <Loading />}

      {responseError != null && (
        <div className="request-error">
          <div>?</div>
          <div>{responseError.response.status}</div>
          <div>
            Pokémon {term} {responseError.response.data}
          </div>
        </div>
      )}

      {pokemon && (
        <div>
          <header
            className={`pokemon-search-header type_${pokemon.types[0].type.name}`}
          >
            {!pokemon.sprites.front_default && (
              <img
                src={questionMark}
                className="not-found-pixelmon"
                alt={pokemon.name}
              />
            )}
            {pokemon.sprites.front_default && (
              <img src={pokemon.sprites.front_default} alt={pokemon.name} />
            )}

            <div className="pokemon-title">
              <h1 className="pokemon-title-name">{pokemon.name}</h1>
              {pokemon.types.map((type, index) => (
                <div
                  className={`pokemon-type-tag type_${type.type.name}`}
                  key={index}
                >
                  {type.type.name}
                </div>
              ))}
            </div>
            {!pokemon.sprites.front_default && (
              <img
                src={questionMark}
                className="not-found-pixelmon"
                alt={pokemon.name}
              />
            )}
            {pokemon.sprites.front_default && (
              <img src={pokemon.sprites.front_default} alt={pokemon.name} />
            )}
          </header>

          <div className="pokemon-card-container">
            <div
              className={`pokemon-card type_gradient_${pokemon.types[0].type.name}`}
            >
              <div className="card-content">
                {!pokemon.sprites.other["official-artwork"].front_default && (
                  <div>
                    <img
                      src={questionMark}
                      className="not-found-pixelmon"
                      alt={pokemon.name}
                    />
                    <div style={{ textAlign: "center" }}>Image Not Found</div>
                  </div>
                )}
                {pokemon.sprites.other["official-artwork"].front_default && (
                  <img
                    className="pokemon-card-image"
                    src={
                      pokemon.sprites.other["official-artwork"].front_default
                    }
                    alt={pokemon.name}
                  />
                )}
                <span>{pokemon.description}</span>
              </div>
            </div>
          </div>

          {pokemonChain?.length && (
            <div className="pokemon-evolution">
              <h1 className="section-title">Evolution</h1>
              <div className="pokemon-chain">
                {pokemonChain.map((pokechain, index) => (
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
          )}

          {cardImages.length != 0 && (
            <div className="cards-carousel">
              <h1 className="section-title">Cards</h1>
              <Carousel images={cardImages} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
