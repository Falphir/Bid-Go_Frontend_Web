import React, {Component} from 'react';
import { Link } from 'react-router';
import './Navbar.css'
import Logo from '../assets/logo.png'
import UserImage from '../assets/person.png'

class Navbar extends Component {
    render() {
        return (
            <header className="header">
                <div className="logo">
                    <img src={Logo} height={36}/>
                </div>
                <div className="user-info">
                    <nav className="nav-links">
                        <Link to="/history" className="nav-link">Histórico</Link>
                    </nav>
                    {/* Placeholder for notifications.  Could show a number of alerts as a badge. */}
                    <span className="notifications" role="img" aria-label="notificações">🔔</span>
                    <div className="company">
                        {/* Simple graphic to represent the company logo */}
                        <img src={UserImage} height={36}/>
                        <div className="company-text">
                            <span className="company-name">Continente</span>
                            <span className="company-type">Empresa</span>
                        </div>
                    </div>
                </div>
            </header>
        );
    }
}

export default Navbar;