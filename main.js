import Config from "./config.js";
import { difference, mustBeBetween } from "./tools.js";
import * as grover from "grover.grover";

// component objects
const TOKEN_BET_INPUT     = document.getElementById("token-bet-input");
const SWING_BET_INPUT     = document.getElementById("swing-bet-input");
const GAINS_OUTPUT        = document.getElementById("gains-output");
const TOKEN_WALLET_OUTPUT = document.getElementById("token-wallet-output");
const SPIN_BUTTON         = document.getElementById("spin-button");

const REEL_SLOT_1 = document.getElementById("reel-slot-1");
const REEL_SLOT_2 = document.getElementById("reel-slot-2");
const REEL_SLOT_3 = document.getElementById("reel-slot-3");
const REEL_SLOT_4 = document.getElementById("reel-slot-4");
const REEL_SLOTS = [REEL_SLOT_1, REEL_SLOT_2, REEL_SLOT_3, REEL_SLOT_4];

const STATUS_ANNOUCERS = [ ...document.getElementsByClassName("status-annoucment") ];
const CORRECT_VALUE_OUTPUT = document.getElementById("correct-value-output");

let SLOT_INDEXES = [3, 4, 7, 2];

// values
let currentTokenCount = 0;
let currentTokenBet = 500;
let currentSwingBet = 25;
let currentGains = 0;


/// --- TOOLS ----



/// ----------------------------
/// --- INPUT PANEL HANDLING ---




const recalculateGains = () => {
  const swingRatio = 1 - (currentSwingBet / 25);
  const currentGainsRate = 1.5 * Math.pow(swingRatio, 1.8);
  
  const oldGains = currentGains;
  currentGains = Math.floor(currentGainsRate * currentTokenBet);
  
  gradualyChangeDisplayValue(GAINS_OUTPUT, currentGains - oldGains);
};

TOKEN_BET_INPUT.addEventListener("change", (evt) => {
  mustBeBetween(evt, Config.MIN_TOKEN_BET, currentTokenCount);

  currentTokenBet = Number(evt.target.value);
  recalculateGains();
});

SWING_BET_INPUT.addEventListener("change", (evt) => {
  mustBeBetween(evt, Config.MIN_SWING_BET, Config.MAX_SWING_BET);

  currentSwingBet = Number(evt.target.value);
  recalculateGains();
});



/// -------------------------------
/// --- TOKEN COUNTER HANDLING ---



const gradualyChangeDisplayValue = (elementObject, change) => {
  if(change === 0) {

    return Promise.resolve();
  }

  const oldValue = Number(elementObject.value);

  let iteration = 0;

  elementObject.classList.add("text-pulsing");

  return new Promise((resolve) => {

    const intervalHandle = setInterval(() => {
      iteration++;

      let valueToDisplay = Math.round(
        oldValue + (change * iteration) / Config.ITERATIONS_COUNT
      );

      if(iteration >= Config.ITERATIONS_COUNT) {
        valueToDisplay = oldValue + change;
      }

      elementObject.value = valueToDisplay;

      if (iteration >= Config.ITERATIONS_COUNT) {
        clearInterval(intervalHandle);
        elementObject.classList.remove("text-pulsing");
        resolve();
      }

    }, Config.INTERVAL_LENGHT_MS);

  });
};


/// ---------------------
/// --- SPIN HANDLING ---



const rollNextTurn = () => {
  // generate number in range <05; 10>
  const qubitCount = Math.floor(
    (Math.random() * 6) + 5
  );
  
  const maxPossibleAnswer = 2**qubitCount;

  // generate number in range of possible answer for n qubits
  const targetAnswer = Math.floor(
    Math.random() * maxPossibleAnswer
  ); 

  return {
    qubitCount, targetAnswer
  };
}


const displayAnnoucment = (text) => {
  STATUS_ANNOUCERS.forEach((oneAnnoucer) => {

    oneAnnoucer.value = text;
  });
}

const clearAnnoucment = () => {
  STATUS_ANNOUCERS.forEach((oneAnnoucer) => {

    oneAnnoucer.value = "";
  });
}


const toggleInputs = (state) => {
  SPIN_BUTTON.disabled = state;
  TOKEN_BET_INPUT.disabled = state;
  SWING_BET_INPUT.disabled = state;
};

let isSpinning = false;

const spin = () => {
  isSpinning = true;
  toggleInputs(true);
  clearAnnoucment();

  const currentTurnData = rollNextTurn();


  CORRECT_VALUE_OUTPUT.value = currentTurnData.targetAnswer;


  let intervalHandler = setInterval(() => {
    SLOT_INDEXES = SLOT_INDEXES.map((val) => (val + 1) % 10);

    REEL_SLOTS.forEach((oneSlot, index) => {
      oneSlot.innerText = SLOT_INDEXES[index];
    });
    
  }, 80);


  var groverResult = grover.grover.callPromising(
    [currentTurnData.targetAnswer],
    currentTurnData.qubitCount,
    currentSwingBet
  );


  groverResult.then((groverFoundValue) => {
    clearInterval(intervalHandler);

    const digits = String(groverFoundValue.toJs())
      .padStart(REEL_SLOTS.length, "0")
      .slice(-REEL_SLOTS.length)
      .split("")
      .map(Number);


    SLOT_INDEXES = digits;

    REEL_SLOTS.forEach((oneSlot, index) => {
      oneSlot.innerText = digits[index];
    });



    if(groverFoundValue === currentTurnData.targetAnswer) {
      displayAnnoucment("W.I.N");

      currentTokenCount += currentGains;
      gradualyChangeDisplayValue(
        TOKEN_WALLET_OUTPUT, currentGains
      );
    }
    else {
      displayAnnoucment("L.O.S.S");
      
      currentTokenCount -= currentTokenBet;
      gradualyChangeDisplayValue(
        TOKEN_WALLET_OUTPUT, -currentTokenBet
      );
    }


  })
  .catch((error) => {
    console.log(error);

    clearInterval(intervalHandler);
  })
  .finally(() => {
    isSpinning = false;
    toggleInputs(false);

    console.log("Current Tokens: ", currentTokenCount);
  })

};

SPIN_BUTTON.addEventListener("click", async () => {
  if(isSpinning) {
    return;
  }

  spin();
});

const init = () => {
  TOKEN_BET_INPUT.value = currentTokenBet;
  SWING_BET_INPUT.value = currentSwingBet;
  GAINS_OUTPUT.value = 0;
  recalculateGains();

  currentTokenCount = Config.STARTING_TOKEN_COUNT;
  TOKEN_WALLET_OUTPUT.value = 0;
  gradualyChangeDisplayValue(TOKEN_WALLET_OUTPUT, currentTokenCount);


  REEL_SLOTS.forEach((oneSlot, index) => {
    oneSlot.innerText = SLOT_INDEXES[index];
  });

  clearAnnoucment();
  
  console.log("Initialized Successfuly");
};

init();

console.log(JSON.stringify(Config));

await new Promise(() => {});