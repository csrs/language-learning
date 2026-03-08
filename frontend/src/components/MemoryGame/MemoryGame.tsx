import { useEffect, useState } from "react";

type Card = {
  cardText: string;
  id: number;
  pairId: number;
};

const organizedCards: Card[] = [
  {
    cardText: "France",
    id: 3,
    pairId: 1,
  },
  {
    cardText: "Paris",
    id: 1,
    pairId: 1,
  },
  {
    cardText: "Germany",
    id: 2,
    pairId: 2,
  },
  {
    cardText: "Berlin",
    id: 4,
    pairId: 2,
  },
  {
    cardText: "Spain",
    id: 5,
    pairId: 3,
  },
  {
    cardText: "Madrid",

    id: 6,
    pairId: 3,
  },
  {
    cardText: "Japan",

    id: 7,
    pairId: 4,
  },
  {
    cardText: "Tokyo",

    id: 8,
    pairId: 4,
  },
  {
    cardText: "Canada",
    id: 9,
    pairId: 5,
  },
  {
    cardText: "Ottawa",
    id: 10,
    pairId: 5,
  },
];

// Fisher-Yates Shuffle
const shuffleCards = (items: Card[]): Card[] => {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const cards = shuffleCards(organizedCards);

export const MemoryGame = () => {
  const [guessedCardIdPair, setGuessedCardIdPair] = useState<number[]>([]);
  const [matchedCardIds, setMatchedCardIds] = useState<number[]>([]);
  const [isCardProcessing, setIsCardProcessing] = useState(false);

  const getPairIdById = (id: number): number => {
    const card = cards.find((c) => c.id === id);
    return card.pairId;
  };

  const resolveCardState = (card: Card) => {
    if (guessedCardIdPair.length == 2) {
      // already have 2 flipped cards
      setGuessedCardIdPair([card.id]);
    } else if (guessedCardIdPair.length === 1) {
      // get the pairId of the card with the given card.id
      const alreadyGuessedPairId = getPairIdById(guessedCardIdPair[0]);
      if (card.pairId === alreadyGuessedPairId) {
        // second card is a match
        setMatchedCardIds((prev) => [...prev, card.id, guessedCardIdPair[0]]);
        setGuessedCardIdPair([]);
      } else {
        // second card isn't a match
        setGuessedCardIdPair([]);
      }
    } else {
      setGuessedCardIdPair((prev) => [...prev, card.id]);
    }
  };

  const handleCardFlip = (card: Card) => {
    setTimeout(() => {
      // happens after 100ms
      setIsCardProcessing(false);
      resolveCardState(card);
    }, 1000);
    // happens immediately
    setIsCardProcessing(true);
  };

  const getClassName = (c: Card) => {
    if (matchedCardIds.includes(c.id)) {
      return "matched";
    } else if (guessedCardIdPair.includes(c.id)) {
      return "guessed";
    }
    return "";
  };

  useEffect(() => {
    if (cards.length === matchedCardIds.length) {
      alert("congrats!");
      setGuessedCardIdPair([]);
      setMatchedCardIds([]);
    }
  }, [matchedCardIds]);

  return (
    <>
      <strong>Instructions:</strong>
      <div>
        <ol>
          <li>
            Click on a country or capital city. There is a 500ms timeout after
            clicking on a button where you can't click on another button, to
            prevent clicking on buttons in quick succession.
          </li>
          <li>
            Click on your guess of the corresponding capital city or country
          </li>
          <li>
            Correct paris will change to green text color, incorrect pairs will
            be "reset" to black text color
          </li>
        </ol>
      </div>

      {cards.map((c) => (
        <button
          key={c.cardText}
          onClick={() => handleCardFlip(c)}
          disabled={
            isCardProcessing ||
            matchedCardIds.includes(c.id) ||
            guessedCardIdPair.includes(c.id)
          }
          className={`matchingGameButton ${getClassName(c)}`}
        >
          {c.cardText}
        </button>
      ))}
    </>
  );
};
