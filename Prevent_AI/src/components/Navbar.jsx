import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Landing' },
  { to: '/profile-selection', label: 'Profile Selection' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/data-entry', label: 'Data Entry' },
]

function Navbar() {
  return (
    <header className="top-nav">
      <div className="top-nav-inner">
        <p className="brand">Prevent AI</p>
        <nav className="nav-links" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
