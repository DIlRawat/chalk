import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';  

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <h1>Chalk</h1>
      </div>
      <nav>
        <ul className={styles['nav-links']}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
      </nav>
      <div className={styles['auth-buttons']}>
        <button className={styles['signup-btn']}>Sign Up</button>
      </div>
    </header>
  );
};

export default Header;

