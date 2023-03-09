import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import "../styles/Searchbar.css";

export const Searchbar = () => {
  const navigate = useNavigate();
  const { searchTerm } = useParams();
  const [term, setTerm] = useState(searchTerm || "");

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTerm(e.target.value);
  };

  const handleClick = () => {
    navigate(`pokemon/${term.trim() || ""}`);
  };

  return (
    <div className="search-bar">
      <div className="search-input">
        <input
          type="text"
          name="search"
          value={term}
          onChange={handleInput}
          placeholder="Buscar pokemons..."
        />
        <button className="search-btn" onClick={handleClick}>
          <FaSearch />
        </button>
      </div>
    </div>
  );
};
