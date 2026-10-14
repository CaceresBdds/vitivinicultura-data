import { NavLink, Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <NavLink to="/" className="app-brand">
            <span className="app-brand__mark" aria-hidden="true" />
            Vitivinicultura Argentina
          </NavLink>
          <nav className="app-nav" aria-label="Navegación principal">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `app-nav__link${isActive ? " app-nav__link--active" : ""}`
              }
            >
              Panorama nacional
            </NavLink>
            <NavLink
              to="/provinces"
              className={({ isActive }) =>
                `app-nav__link${isActive ? " app-nav__link--active" : ""}`
              }
            >
              Provincias
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        Datos públicos del Instituto Nacional de Vitivinicultura procesados por
        el pipeline ETL del proyecto.
      </footer>
    </div>
  );
}
