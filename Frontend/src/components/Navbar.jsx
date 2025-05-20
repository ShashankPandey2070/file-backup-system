import React from 'react';

const Navbar = () => {
    return (
        <nav style={styles.nav}>
            <div style={styles.logo}>ViewRecord</div>
            <ul style={styles.navLinks}>
                <li><a href="/" style={styles.link}>Home</a></li>
                <li><a href="/about" style={styles.link}>About</a></li>
                <li><a href="/contact" style={styles.link}>Contact</a></li>
            </ul>
        </nav>
    );
};

const styles = {
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#333',
        padding: '10px 20px',
        color: '#fff',
        width: '100%'
    },
    logo: {
        fontWeight: 'bold',
        fontSize: '1.5rem'
    },
    navLinks: {
        listStyle: 'none',
        display: 'flex',
        gap: '20px',
        margin: 0,
        padding: 0
    },
    link: {
        color: '#fff',
        textDecoration: 'none'
    }
};

export default Navbar;