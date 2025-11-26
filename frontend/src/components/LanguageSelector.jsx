import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LanguageSelector.module.css";
import { getCharacters } from "../services/api";

export default function LanguageSelector() {
  const [language, setLanguage] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNext = async () => {
    setErrorMessage(null);

    if (language === "select" || language === "") {
      setErrorMessage("Must select a valid language from the dropdown");
      return;
    }

    setLoading(true);
    try {
      const data = await getCharacters(language);
      console.log("Characters received", data);

      // Save to localStorage
      localStorage.setItem("chalk_language", language);
      localStorage.setItem("chalk_alphabets", JSON.stringify(data.alphabets));
      localStorage.setItem("chalk_digits", JSON.stringify(data.digits));

      navigate("/practice");
    } catch (error) {
      setErrorMessage("Failed to load characters. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.selectLanguage}>
        <h2>Select Your Language</h2>
        <select
          name="language"
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={loading}
        >
          <option value="">Select</option>
          <option value="English">English</option>
          <option value="French">French</option>
          <option value="Spanish">Spanish</option>
          <option value="Hindi">Hindi</option>
          <option value="Nepali">Nepali</option>
        </select>
        {errorMessage && <div className={styles.error}>{errorMessage}</div>}
      </div>
      <div className={styles.nextButton}>
        <button onClick={handleNext} disabled={loading}>
          {loading ? "Loading..." : "Get Started →"}
        </button>
      </div>
    </div>
  );
}
