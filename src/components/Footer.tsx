import "../styles/Footer.css";
import { FaLinkedin, FaGithub } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const developerName = "Horacio Schumann";

  return (
    <footer className="footer">
      <p>
        {developerName} - {currentYear}
      </p>
      <p>
        Contato:{" "}
        <a href="mailto:horacio.schumann@gmail.com">
          horacio.schumann@gmail.com
        </a>
      </p>
      <div className="social-icons">
        <a href="https://www.linkedin.com/in/horaciosdev" target="_blank">
          <FaLinkedin />
        </a>
        <a href="https://github.com/horaciosdev" target="_blank">
          <FaGithub />
        </a>
      </div>
      <p>
        Todos os direitos reservados © {currentYear} {developerName}
      </p>
    </footer>
  );
}
