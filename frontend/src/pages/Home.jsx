import LanguageSelector from "../components/LanguageSelector";
import styles from "./Home.module.css";

export default function Home() {
    return (
        <div className={styles.page}>

            <main className={styles.main}>
                <section className={styles.hero}>
                    <h1 className={styles.heroTitle}>
                        Learn by Writing,
                        <br />
                        <span className={styles.accent}>The AI Way</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Master letters and numbers in any language with real-time AI feedback and personalized coaching.
                    </p>
                </section>

                <div className={styles.selectorWrapper}>
                    <LanguageSelector />
                </div>

                <section className={styles.features}>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>🌍</div>
                        <h3>Multi-Language Support</h3>
                        <p>Practice in English, Spanish, French, Hindi, Nepali, and more</p>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>🤖</div>
                        <h3>AI-Powered Feedback</h3>
                        <p>Get instant, accurate feedback on your handwriting</p>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>🎯</div>
                        <h3>Personal Coach</h3>
                        <p>Receive tailored hints to improve your technique</p>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>♿</div>
                        <h3>Accessible Learning</h3>
                        <p>Audio feedback for users with reading difficulties</p>
                    </div>
                </section>
            </main>

            <footer className={styles.footer}>
                <p>© 2024 Chalk • Built with Google AI for learners worldwide</p>
            </footer>
        </div>
    );
}
