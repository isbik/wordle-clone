import { useEffect, useState, useCallback } from "react";
import "./style.css";
import { words, allowedLetters, KEYBOARD } from "./words";

const SIZE = 5;
const TRIES = 6;

const generate = () =>
  Array.from({ length: TRIES }).map(() => {
    return Array.from({ length: SIZE }).map(() => null);
  });

function App() {
  const [word, setWord] = useState(
    words[Math.floor(Math.random() * words.length)].toUpperCase()
  );
  const [status, setStatus] = useState(null);

  const [attempt, setAttempt] = useState(0);

  const [field, setField] = useState(generate());

  const [animate, setAnimate] = useState();

  const handleGameAgain = () => {
    setStatus(null);
    setField(generate());
    setWord(words[Math.floor(Math.random() * words.length)].toUpperCase());
    setAttempt(0);
  };

  const runAnimation = useCallback(() => {
    if (animate) return;

    setAnimate(true);

    setTimeout(() => {
      setAnimate(false);
    }, 400);
  }, [animate]);

  const handleSendWord = useCallback(() => {
    const isFilled = field[attempt].every((letter) => letter);

    if (!isFilled) return runAnimation();

    const guessedWord = field[attempt].map((letter) => letter).join("");

    if (!words.includes(guessedWord.toLowerCase())) return runAnimation();

    setAttempt(attempt + 1);

    if (field[attempt].every((letter, index) => word[index] === letter)) {
      setStatus("win");
      return;
    }

    if (TRIES === attempt + 1) {
      setStatus("lose");
    }
  }, [attempt, field, runAnimation, word]);

  const handleRemoveLetter = useCallback(() => {
    setField((prev) => {
      let letters = [...prev[attempt]].reverse();

      let index = letters.findIndex((letter) => letter);

      if (index !== -1) {
        prev[attempt][SIZE - index - 1] = null;
      }
      return [...prev];
    });
  }, [attempt]);

  const handleEnterKey = useCallback(
    (key) => {
      if (status) return;

      if (key === "Enter") return handleSendWord();

      if (key === "Backspace") return handleRemoveLetter();

      if (allowedLetters.includes(key.toLowerCase())) {
        setField((prev) => {
          let index = prev[attempt].findIndex((letter) => !letter);

          if (index !== -1) {
            prev[attempt][index] = key.toUpperCase();
          }
          return [...prev];
        });
      }
    },
    [attempt, handleRemoveLetter, handleSendWord, status]
  );

  useEffect(() => {
    const handler = (e) => {
      handleEnterKey(e.key);
    };
    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, [attempt, field, handleEnterKey, runAnimation, status, word]);

  const highlightLetter = (letter, index) => {
    if (word[index] === letter) return "#06CB84";
    if (word.includes(letter)) return "#F1E14C";
    return false;
  };

  const highlightKeyboardLetter = (letter) => {
    let inBoard = false;
    
    for (let i = 0; i < attempt; i++) {
      for (let j = 0; j < field[i].length; j++) {
        if (letter === field[i][j]) {
          inBoard = true;
          if (highlightLetter(letter, j)) return highlightLetter(letter, j);
        }
      }
    }

    if (inBoard) return "#985d26";
  };

  return (
    <div className="field">
      {status && (
        <div className="modal">
          <p>Вы {status === "win" ? "Выиграли" : "Проиграли"}</p>
          <p>Слово: {word}</p>
          <button onClick={handleGameAgain} className="btn">
            Играть снова
          </button>
        </div>
      )}
      {field.map((row, rowIndex) => (
        <div
          className={`row ${
            animate && rowIndex === attempt ? "row-animate" : ""
          }`}
          key={rowIndex}
        >
          {row.map((letter, letterIndex) => (
            <div
              className="letter"
              style={{
                background:
                  attempt - 1 < rowIndex
                    ? "#985d26"
                    : highlightLetter(letter, letterIndex),
              }}
              key={SIZE * rowIndex + letterIndex}
            >
              {letter}
            </div>
          ))}
        </div>
      ))}

      <div className="keyboard">
        {[KEYBOARD[0], KEYBOARD[1]].map((keys, index) => (
          <div className="keys-row" key={index}>
            {keys.map((key) => (
              <div
                className="key"
                onClick={() => handleEnterKey(key)}
                key={key}
                style={{ background: highlightKeyboardLetter(key) }}
              >
                {key}
              </div>
            ))}
          </div>
        ))}

        {[KEYBOARD[2]].map((keys, index) => (
          <div className="keys-row" key={index}>
            <div onClick={handleSendWord} className="key">
              Enter
            </div>
            {keys.map((key) => (
              <div
                className="key"
                onClick={() => handleEnterKey(key)}
                key={key}
                style={{ background: highlightKeyboardLetter(key) }}
              >
                {key}
              </div>
            ))}
            <div onClick={handleRemoveLetter} className="key">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                <line x1="18" y1="9" x2="12" y2="15"></line>
                <line x1="12" y1="9" x2="18" y2="15"></line>
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
