import { riddles } from "../vocab.js";

// Now you can use the riddles array as before
console.log(riddles);

// confetti function/code
function launchConfetti() {
  const confettiContainer = document.createElement("div");
  confettiContainer.classList.add("confetti-container");

  for (let i = 0; i < 30; i++) {
    const confettiPiece = document.createElement("div");
    confettiPiece.classList.add("confetti");
    confettiPiece.style.left = `${Math.random() * 100}%`;
    confettiPiece.style.animationDelay = `${Math.random() * 2}s`;
    confettiPiece.style.backgroundColor = `hsl(${
      Math.random() * 360
    }, 100%, 70%)`;
    confettiContainer.appendChild(confettiPiece);
  }

  document.body.appendChild(confettiContainer);

  setTimeout(() => {
    confettiContainer.remove();
  }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  const settingsContainer = document.querySelector(".settings-container");
  const settingsDropdown = document.getElementById("settings-dropdown");
  const difficultyOptions = document.querySelectorAll(
    "input[name='difficulty']"
  );
  const selectedDifficulty = document.getElementById("selected-difficulty");
  const correctSound = new Audio("../sounds/success.wav");
  const incorrectSound = new Audio("../sounds/incorrect.wav");

  settingsContainer.addEventListener("mouseenter", () => {
    settingsDropdown.classList.add("visible");
  });

  settingsContainer.addEventListener("mouseleave", () => {
    settingsDropdown.classList.remove("visible");
  });

  difficultyOptions.forEach((option) => {
    option.addEventListener("change", () => {
      selectedDifficulty.textContent = option.value;
    });
  });

  const riddlesContainer = document.getElementById("riddle-container");
  const dropZone = document.getElementById("drop-zone");
  const wordOptions = document.getElementById("word-options");
  const languageCheckboxes = {
    romanUrdu: document.getElementById("romanUrdu"),
    urdu: document.getElementById("urdu"),
    english: document.getElementById("english"),
  };

  let currentDifficulty = "Easy";
  let currentRiddle = null;

  function getRandomRiddle() {
    const filteredRiddles = riddles.filter(
      (r) => r.riddles[currentDifficulty.toLowerCase()]
    );
    return filteredRiddles[Math.floor(Math.random() * filteredRiddles.length)];
  }

  function updateRiddle() {
    currentRiddle = getRandomRiddle();
    if (!currentRiddle) return;
    const riddleTexts = currentRiddle.riddles[currentDifficulty.toLowerCase()];

    riddlesContainer.innerHTML = "";
    wordOptions.innerHTML = "";

    const selectedLanguages = Object.keys(languageCheckboxes).filter(
      (lang) => languageCheckboxes[lang].checked
    );

    if (selectedLanguages.length === 0) {
      riddlesContainer.innerHTML =
        "<p>Please select at least one language.</p>";
      return;
    }

    const riddleRow = document.createElement("div");
    riddleRow.classList.add("riddle-row");
    const riddleBox = document.createElement("div");
    riddleBox.classList.add("riddle-box");

    if (languageCheckboxes.romanUrdu.checked) {
      const romanText = document.createElement("p");
      romanText.textContent = riddleTexts.romanUrdu;
      romanText.classList.add("roman-text");
      riddleBox.appendChild(romanText);
    }

    if (languageCheckboxes.urdu.checked) {
      const urduText = document.createElement("p");
      urduText.textContent = riddleTexts.urdu;
      urduText.classList.add("urdu-text");
      riddleBox.appendChild(urduText);
    }

    if (languageCheckboxes.english.checked) {
      const englishText = document.createElement("p");
      englishText.textContent = riddleTexts.english;
      englishText.classList.add("english-text");
      riddleBox.appendChild(englishText);
    }

    riddleRow.appendChild(riddleBox);
    riddlesContainer.appendChild(riddleRow);
    generateWordOptions(currentRiddle.word);
  }

  function generateWordOptions(correctAnswer) {
    if (!correctAnswer) return;
    wordOptions.innerHTML = "";

    const wordCount =
      currentDifficulty === "Easy"
        ? 3
        : currentDifficulty === "Medium"
        ? 5
        : 10;

    const words = [
      {
        romanUrdu: correctAnswer.romanUrdu,
        urdu: correctAnswer.urdu,
        image: currentRiddle.image, // ✅ get correct image from riddle object
      },
      ...getRandomIncorrectWords(wordCount - 1, correctAnswer),
    ];

    shuffleArray(words);

    words.forEach((word) => {
      const wordBox = document.createElement("div");
      wordBox.classList.add("word");

      wordBox.innerHTML = `
        <p class='roman-text'>${word.romanUrdu}</p>
        <img src="${word.image}" alt="${word.romanUrdu}" class="option-image" />
        <p class='urdu-text'>${word.urdu}</p>
      `;

      wordBox.addEventListener("click", () => {
        const selectedWord = word;
        const correctWord = currentRiddle.word;

        if (
          selectedWord.romanUrdu === correctWord.romanUrdu &&
          selectedWord.urdu === correctWord.urdu
        ) {
          dropZone.innerHTML = `
            <div class="roman">${selectedWord.romanUrdu}</div>
            <img src="${selectedWord.image}" alt="${selectedWord.romanUrdu}" class="dropzone-image" />
            <div class="urdu">${selectedWord.urdu}</div>
          `;
          dropZone.classList.add("correct");
          correctSound.play();
          launchConfetti();

          setTimeout(() => {
            updateRiddle();
            dropZone.textContent = "Select An Answer";
            dropZone.classList.remove("correct");
          }, 2000);
        } else {
          dropZone.textContent = "Try Again!";
          dropZone.classList.add("incorrect");
          wordBox.classList.add("incorrect"); // ✅ Highlight the incorrect word
          incorrectSound.play();

          setTimeout(() => {
            dropZone.classList.remove("incorrect");
            wordBox.classList.remove("incorrect"); // ✅ Remove the visual indicator
          }, 500);
        }
      });

      wordOptions.appendChild(wordBox);
    });
  }

  function getRandomIncorrectWords(count, correctAnswer) {
    const allWords = riddles
      .filter((r) => r.word.romanUrdu !== correctAnswer.romanUrdu)
      .map((r) => ({
        romanUrdu: r.word.romanUrdu,
        urdu: r.word.urdu,
        image: r.image, // ✅ pull image from main riddle object
      }));
    shuffleArray(allWords);
    return allWords.slice(0, count);
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  difficultyOptions.forEach((option) => {
    option.addEventListener("change", (event) => {
      currentDifficulty = event.target.value;
      updateRiddle();
    });
  });

  Object.values(languageCheckboxes).forEach((checkbox) => {
    checkbox.addEventListener("change", updateRiddle);
  });

  updateRiddle();
});
