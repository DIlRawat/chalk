import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const getCharacters = async (language) => {
    try {
        const response = await axios.post(`${API_URL}/get-characters`, { language });
        return response.data;
    } catch (error) {
        console.error('Error fetching characters:', error);
        throw error;
    }
};

export const checkOCR = async (image, expectedChar, language = "English") => {
    try {
        const response = await axios.post(`${API_URL}/check-ocr`, {
            image,
            expected_char: expectedChar,
            language,
        });
        return response.data;
    } catch (error) {
        console.error("Error checking OCR:", error);
        throw error;
    }
};

export const getCoachFeedback = async (history, language = "English") => {
    try {
        const response = await axios.post(`${API_URL}/coach`, {
            history,
            language,
        });
        return response.data;
    } catch (error) {
        console.error("Error getting coach feedback:", error);
        throw error;
    }
};
