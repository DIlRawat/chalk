import { Link } from "react-router-dom";
import styles from "./About.module.css";

export default function About() {
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <div className={styles.content}>
                    <h1 className={styles.title}>About Chalk</h1>

                    <section className={styles.story}>
                        <p className={styles.lead}>
                            This app was created for my mother, who never had access to education.
                            Now in her later years, she can't attend classes, but she has access to technology.
                        </p>
                        <p>
                            I built Chalk so she - and others like her - could finally learn to read and write,
                            at their own pace, from the comfort of home.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>Who This Helps</h2>
                        <div className={styles.audienceGrid}>
                            <div className={styles.audienceCard}>
                                <span className={styles.icon}>👵</span>
                                <h3>Adults Without Education</h3>
                                <p>People who never had the chance to learn, but have access to technology</p>
                            </div>
                            <div className={styles.audienceCard}>
                                <span className={styles.icon}>👶</span>
                                <h3>Young Learners</h3>
                                <p>Children learning their first letters and numbers</p>
                            </div>
                            <div className={styles.audienceCard}>
                                <span className={styles.icon}>♿</span>
                                <h3>Accessible Learning</h3>
                                <p>Audio feedback for those who need it</p>
                            </div>
                        </div>
                    </section>

                    <section className={styles.mission}>
                        <h2>How It Works</h2>
                        <p>
                            Choose your language, practice writing on the canvas, and get instant AI feedback
                            in your chosen language—with audio support. A personal coach provides hints to help you improve.
                        </p>
                    </section>

                    <div className={styles.cta}>
                        <Link to="/" className={styles.ctaButton}>Start Learning</Link>
                    </div>
                </div>
            </main>

            <footer className={styles.footer}>
                <p>© 2024 Chalk • Built with love for learners everywhere</p>
            </footer>
        </div>
    );
}
