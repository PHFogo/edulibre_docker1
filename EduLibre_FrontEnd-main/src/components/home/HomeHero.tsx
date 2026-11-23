import { Link } from 'react-router-dom';

export default function HomeHero() {
  return (
    <section className="museum-hero">
      <div className="museum-hero-copy">
        <p className="eyebrow">EduLivre / Um encontro com o conhecimento</p>
        <h1>
          Aprenda com quem
          <br />
          <em>amplia seu mundo.</em>
        </h1>
        <p className="museum-intro">
          Toda descoberta começa com uma boa pergunta. Encontre professores,
          explore novos saberes e dê espaço à sua curiosidade.
        </p>
        <div className="hero-actions">
          <Link to="/professores" className="primary-button">
            Explorar aulas <span aria-hidden="true">↗</span>
          </Link>
          <a href="#sobre" className="text-link">
            Conheça a EduLivre
          </a>
        </div>
        <div className="museum-hero-note">
          <span>01 —</span> Aprender é uma experiência para a vida.
        </div>
      </div>
    </section>
  );
}
