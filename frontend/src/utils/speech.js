const LANGUAGE_MAP = {
    "English": "en-US",
    "Spanish": "es-ES",
    "French": "fr-FR",
    "German": "de-DE",
    "Italian": "it-IT",
    "Portuguese": "pt-PT",
    "Russian": "ru-RU",
    "Japanese": "ja-JP",
    "Korean": "ko-KR",
    "Chinese": "zh-CN",
    "Hindi": "hi-IN",
    "Nepali": "ne-NP",
    // Add more as needed, fallback to en-US
};

export const speak = (text, language = "English") => {
    if (!window.speechSynthesis) {
        console.warn("Text-to-speech not supported in this browser.");
        return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Map language name to BCP 47 tag
    let langCode = LANGUAGE_MAP[language] || "en-US";

    // Special handling for Nepali: Fallback to Hindi if Nepali voice is missing
    // as Hindi voices usually support Devanagari script better than generic English voices
    if (langCode === "ne-NP") {
        const voices = window.speechSynthesis.getVoices();
        const hasNepaliVoice = voices.some(v => v.lang === "ne-NP");
        if (!hasNepaliVoice) {
            console.log("Nepali voice not found, falling back to Hindi for Devanagari support.");
            langCode = "hi-IN";
        }
    }

    utterance.lang = langCode;
    utterance.rate = 0.9; // Slightly slower for clarity

    window.speechSynthesis.speak(utterance);
};
