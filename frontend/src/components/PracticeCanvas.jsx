import { useRef, useState, useEffect } from "react";
import { FaEraser, FaCheck, FaArrowLeft, FaArrowRight, FaVolumeUp, FaLightbulb } from "react-icons/fa";
import { checkOCR } from "../services/api";
import { speak } from "../utils/speech";
import styles from "./PracticeCanvas.module.css";

export default function PracticeCanvas({ character, language, onNext, onPrev, onAttempt, onGetHint, loadingHint, coachHint, onReplayHint }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Set canvas size
        canvas.width = 300;
        canvas.height = 300;

        // Fill white background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Set style
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        ctx.strokeStyle = "black";

        // Clear on character change
        clearCanvas();
        setFeedback(null);
    }, [character]);

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Fill white background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        setFeedback(null);
    };

    const handleCheck = async () => {
        const canvas = canvasRef.current;
        const image = canvas.toDataURL("image/png");

        setLoading(true);
        try {
            const result = await checkOCR(image, character, language);
            setFeedback(result);

            // Speak feedback
            if (result.match) {
                speak("Correct! " + result.feedback, language);
            } else {
                speak("Try again. " + result.feedback, language);
            }

            if (onAttempt) {
                onAttempt(result);
            }
        } catch (error) {
            setFeedback({ match: false, feedback: "Error checking character." });
            speak("Error checking character.", language);
        } finally {
            setLoading(false);
        }
    };

    const replayFeedback = () => {
        if (feedback) {
            if (feedback.match) {
                speak("Correct! " + feedback.feedback, language);
            } else {
                speak("Try again. " + feedback.feedback, language);
            }
        }
    };

    return (
        <div className={styles.container}>
            <h2>Draw: {character}</h2>

            <div className={styles.canvasWrapper}>
                <button onClick={onPrev} className={styles.navButton} aria-label="Previous character">
                    <FaArrowLeft />
                </button>

                <div className={styles.canvasArea}>
                    <canvas
                        ref={canvasRef}
                        className={styles.canvas}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />
                </div>

                <button onClick={onNext} className={styles.navButton} aria-label="Next character">
                    <FaArrowRight />
                </button>
            </div>

            <div className={styles.controls}>
                <button onClick={clearCanvas} disabled={loading} className={styles.iconButton}>
                    <FaEraser /> Clear
                </button>
                <button onClick={handleCheck} disabled={loading} className={`${styles.iconButton} ${styles.checkButton}`}>
                    <FaCheck /> Check Me
                </button>
            </div>

            {feedback && (
                <div className={`${styles.feedback} ${feedback.match ? styles.success : styles.error}`}>
                    <div className={styles.feedbackContent}>
                        <p><strong>{feedback.match ? "Correct!" : "Try Again"}</strong></p>
                        <p>{feedback.feedback}</p>
                        <p>Confidence: {(feedback.confidence * 100).toFixed(1)}%</p>
                    </div>
                    <button onClick={replayFeedback} className={styles.audioButton} aria-label="Replay feedback">
                        <FaVolumeUp />
                    </button>
                </div>
            )}

            <div className={styles.hintSection}>
                <button onClick={onGetHint} disabled={loadingHint} className={styles.hintButton}>
                    <FaLightbulb /> {loadingHint ? "Thinking..." : "Get Coach Hint"}
                </button>
                {coachHint && (
                    <div className={styles.coachHint}>
                        <div className={styles.hintContent}>
                            <strong>Coach says:</strong> {coachHint}
                        </div>
                        <button onClick={onReplayHint} className={styles.audioButton} aria-label="Replay hint">
                            <FaVolumeUp />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
