import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaLightbulb, FaVolumeUp } from "react-icons/fa";
import PracticeCanvas from "../components/PracticeCanvas";
import { getCoachFeedback } from "../services/api";
import { speak } from "../utils/speech";
import styles from "./Practice.module.css";

export default function Practice() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("select"); // 'select', 'letters', 'numbers'
  const [characters, setCharacters] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [language, setLanguage] = useState("");
  const [history, setHistory] = useState([]);
  const [coachHint, setCoachHint] = useState(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [letterLabel, setLetterLabel] = useState("");
  const [numberLabel, setNumberLabel] = useState("");

  useEffect(() => {
    const lang = localStorage.getItem("chalk_language");
    const alphabets = localStorage.getItem("chalk_alphabets");
    const digits = localStorage.getItem("chalk_digits");

    if (!lang || !alphabets || !digits) {
      navigate("/");
      return;
    }

    setLanguage(lang);

    try {
      const alphabetsData = JSON.parse(alphabets);
      const digitsData = JSON.parse(digits);

      // Determine letter label
      let firstLetter = "";
      let lastLetter = "";

      if (alphabetsData.general && alphabetsData.general.length > 0) {
        firstLetter = alphabetsData.general[0];
        lastLetter = alphabetsData.general[alphabetsData.general.length - 1];
      } else if (alphabetsData.uppercase && alphabetsData.uppercase.length > 0) {
        firstLetter = alphabetsData.uppercase[0];
        // If we have lowercase, use the last lowercase, otherwise last uppercase
        if (alphabetsData.lowercase && alphabetsData.lowercase.length > 0) {
          lastLetter = alphabetsData.lowercase[alphabetsData.lowercase.length - 1];
        } else {
          lastLetter = alphabetsData.uppercase[alphabetsData.uppercase.length - 1];
        }
      }

      if (firstLetter && lastLetter) {
        setLetterLabel(`(${firstLetter}-${lastLetter})`);
      }

      // Determine number label
      if (digitsData && digitsData.length > 0) {
        setNumberLabel(`(${digitsData[0]}-${digitsData[digitsData.length - 1]})`);
      }

    } catch (e) {
      console.error("Error parsing local storage data", e);
    }
  }, [navigate]);

  const startPractice = (selectedMode) => {
    const alphabetsData = JSON.parse(localStorage.getItem("chalk_alphabets"));
    const digitsData = JSON.parse(localStorage.getItem("chalk_digits"));

    let chars = [];
    if (selectedMode === "letters") {
      // Combine lowercase and uppercase if available, or just general
      if (alphabetsData.general && alphabetsData.general.length > 0) {
        chars = alphabetsData.general;
      } else {
        chars = [...(alphabetsData.uppercase || []), ...(alphabetsData.lowercase || [])];
      }
    } else {
      chars = digitsData;
    }

    if (chars.length === 0) {
      alert("No characters found for this mode.");
      return;
    }

    setCharacters(chars);
    setCurrentIndex(0);
    setMode(selectedMode);
    setHistory([]);
    setCoachHint(null);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % characters.length);
    setCoachHint(null);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + characters.length) % characters.length);
    setCoachHint(null);
  };

  const handleBack = () => {
    setMode("select");
    setHistory([]);
    setCoachHint(null);
  };

  const handleAttempt = (result) => {
    const attempt = {
      character: characters[currentIndex],
      match: result.match,
      feedback: result.feedback,
      timestamp: new Date().toISOString(),
    };
    setHistory((prev) => [...prev, attempt]);
  };

  const getHint = async () => {
    if (history.length === 0) {
      const msg = "Practice a few characters first so I can see how you're doing!";
      setCoachHint(msg);
      speak(msg, language);
      return;
    }

    setLoadingHint(true);
    try {
      const data = await getCoachFeedback(history, language);
      setCoachHint(data.hint);
      speak(data.hint, language);
    } catch (error) {
      const msg = "Sorry, I couldn't generate a hint right now.";
      setCoachHint(msg);
      speak(msg, language);
    } finally {
      setLoadingHint(false);
    }
  };

  const replayHint = () => {
    if (coachHint) {
      speak(coachHint, language);
    }
  };

  if (mode === "select") {
    return (
      <div className={styles.container}>
        <div className={styles.topBar}>
          <button onClick={() => navigate("/")} className={styles.backButton}>
            <FaHome /> Back to Home
          </button>
        </div>

        <div className={styles.selectionContent}>
          <h1>Practice {language}</h1>
          <p className={styles.subtitle}>Choose what you'd like to practice</p>

          <div className={styles.selection}>
            <button onClick={() => startPractice("letters")} className={styles.modeButton}>
              <span className={styles.modeIcon}>🔤</span>
              <span className={styles.modeTitle}>Letters</span>
              <span className={styles.modeLabel}>{letterLabel}</span>
            </button>
            <button onClick={() => startPractice("numbers")} className={styles.modeButton}>
              <span className={styles.modeIcon}>🔢</span>
              <span className={styles.modeTitle}>Numbers</span>
              <span className={styles.modeLabel}>{numberLabel}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={handleBack} className={styles.backButton}>
          <FaHome /> Back to Menu
        </button>
        <h1>Practice {mode === "letters" ? "Letters" : "Numbers"}</h1>
      </div>

      <div className={styles.practiceContent}>
        <PracticeCanvas
          character={characters[currentIndex]}
          language={language}
          onNext={handleNext}
          onPrev={handlePrev}
          onAttempt={handleAttempt}
          onGetHint={getHint}
          loadingHint={loadingHint}
          coachHint={coachHint}
          onReplayHint={replayHint}
        />

        <p className={styles.characterCounter}>Character {currentIndex + 1} of {characters.length}</p>
      </div>
    </div>
  );
}
