import axios from "axios";
import { useEffect, useState } from "react";
import "../styles/Home.css";
import question from "../assets/images/question-mark.png";
import pokemon_logotext from "../assets/images/pokemon.png";
import logo from "../assets/images/pokelogo.png";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";

interface IPokemon {
  name: string;
  image: string;
}

export default function Home() {
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState<IPokemon>();

  function handleImageClick() {
    if (pokemon) {
      navigate(`pokemon/${pokemon.name}`);
    }
  }

  useEffect(() => {
    async function loadPokemon() {
      const randomNumber = Math.round(Math.random() * 721);
      const response = await axios(
        `https://pokeapi.co/api/v2/pokemon/${randomNumber}`
      );
      const name = response.data.name;
      const image =
        response.data.sprites.other["official-artwork"].front_default;

      setPokemon({ name, image });
    }

    loadPokemon();
  }, []);

  return (
    <div className="home">
      <h1 className="home-welcome">Bem-vindos, treinadores!</h1>
      {!pokemon && <Loading />}
      {pokemon && (
        <div className="whois-container">
          <img
            className="silhouette"
            onClick={handleImageClick}
            src={pokemon.image}
            alt="Quem é esse pokemon?"
          />
          <div className="whois-text-container">
            <img className="question-mark" src={question} alt="question mark" />
            <img
              className="question-logo-text"
              src={pokemon_logotext}
              alt="pokemon logo"
            />
            <div className="its-pokemon">It's {pokemon.name}</div>
          </div>
        </div>
      )}
      <div className="home-content">
        <h1>Bem-vindos!</h1>
        <p>
          Este site é um projeto feito para praticar minhas habilidades em React
          e o consumo da API Pokeapi, trazendo informações sobre diversos
          Pokémons.
        </p>
        <p>
          Espero que vocês se divirtam explorando as informações e recursos
          disponíveis aqui.
        </p>
        <Link to={"pokemons/"}>
          <img className="pokeball-link" src={logo} alt="pokeball" />
        </Link>
      </div>
    </div>
  );
}
