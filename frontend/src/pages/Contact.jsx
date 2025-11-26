import { Link } from "react-router-dom";
import styles from "./Contact.module.css";

export default function Contact() {
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <div className={styles.content}>
                    <div className={styles.comingSoon}>
                        <h1>Coming Soon</h1>
                        <p>We're working on making it easy for you to get in touch with us.</p>
                        <p>Check back soon!</p>
                    </div>

                    <div className={styles.cta}>
                        <Link to="/" className={styles.ctaButton}>Back to Home</Link>
                    </div>
                </div>
            </main>

            <footer className={styles.footer}>
                <p>© 2024 Chalk • Built with love for learners everywhere</p>
            </footer>
        </div>
    );
}
