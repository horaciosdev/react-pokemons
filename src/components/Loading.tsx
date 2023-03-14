import pokelogo from "../assets/images/pokelogo.png";

export default function Loading() {
  return (
    <div className="poke-loading">
      <img src={pokelogo} alt="loading image" />
    </div>
  );
}
