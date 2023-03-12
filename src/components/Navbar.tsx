import { Link } from "react-router-dom";
import logo from "../assets/images/pokelogo.png";

import "../styles/Navbar.css";
import { Searchbar } from "./Searchbar";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-item">
          <img src={logo} alt="Logo" />
        </Link>
        <Searchbar />
        <div className="navbar-burger">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <div className="navbar-menu">
        <div className="navbar-start">
          <Link to="/" className="navbar-item">
            Home
          </Link>
          <Link to="pokemons/" className="navbar-item">
            Pokemons
          </Link>
          <Link to="contato/" className="navbar-item">
            Contato
          </Link>
          <Link to="sobre/" className="navbar-item">
            Sobre
          </Link>
        </div>

        <div className="navbar-end">
          <a className="navbar-item" href="#">
            Login
          </a>
          <a className="navbar-item" href="#">
            Cadastrar
          </a>
        </div>
      </div>
    </nav>
  );
}
