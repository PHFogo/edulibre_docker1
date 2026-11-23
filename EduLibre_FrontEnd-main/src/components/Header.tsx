import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import './Headers.css';

function Header() {
  const { token, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  useEffect(() => setMenuOpen(false), [location.pathname, token]);

  const isProfessor = user?.isSuperAdmin || user?.roles?.includes('professor');

  useEffect(() => {
    const header = document.querySelector('.header');

    const onScroll = () => {
      if (window.scrollY > 50) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="header"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && menuOpen) {
          setMenuOpen(false);
          menuButton.current?.focus();
        }
      }}
    >
      <div className="header_container">
        <Link to="/" className="logo-link">
          <span className="brand-symbol">
            <img
              src={logo}
              alt="Logo EduLivre"
              className="logo_img"
            />
          </span>
          <strong>EduLivre</strong>
        </Link>

        <button
          ref={menuButton}
          type="button"
          className="header_menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? 'Fechar menu' : 'Menu'}
        </button>
        <nav
          id="main-navigation"
          aria-label="Navegação principal"
          className={`menu_header${menuOpen ? ' menu_header--open' : ''}`}
          onClick={(event) => {
            if ((event.target as HTMLElement).closest('a')) setMenuOpen(false);
          }}
        >
          <Link to="/">Início</Link>
          <Link to="/professores">Professores</Link>

          {token && <Link to="/agendamentos">Agendamentos</Link>}

          {token && isProfessor && (
            <>
              <Link to="/minhas-aulas">Minhas aulas</Link>
              <Link to="/criar-aula">Criar aula</Link>
              <Link to="/agendamentos-recebidos">Agendamentos recebidos</Link>
            </>
          )}

          {token && <NotificationBell />}

          {token ? (
            <Link className="header_account" to="/conta">
              Minha conta
            </Link>
          ) : (
            <Link className="header_login" to="/login">
              Entrar
            </Link>
          )}
          {token && (
            <button className="header_logout" onClick={logout}>
              Sair
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
