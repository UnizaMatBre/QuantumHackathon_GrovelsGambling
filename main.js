import { difference, mustBeBetween } from "./tools.js";
import { run_grover } from "./grover_emulation.js";

// component objects
const TOKEN_BET_INPUT     = document.getElementById("token-bet-input");
const SWING_BET_INPUT     = document.getElementById("swing-bet-input");
const GAINS_OUTPUT        = document.getElementById("gains-output");
const TOKEN_WALLET_OUTPUT = document.getElementById("token-wallet-output");
const SPIN_BUTTON         = document.getElementById("spin-button");

const REEL_SLOT_1 = document.getElementById("reel-slot-1");
const REEL_SLOT_2 = document.getElementById("reel-slot-2");
const REEL_SLOT_3 = document.getElementById("reel-slot-3");
const REEL_SLOTS = [REEL_SLOT_1, REEL_SLOT_2, REEL_SLOT_3];

const STATUS_ANNOUCERS = [ ...document.getElementsByClassName("status-annoucment") ];
const CORRECT_VALUE_OUTPUT = document.getElementById("correct-value-output");

// contants
const MAX_SWING_BET = 26;
const MIN_SWING_BET = 1;
const MIN_TOKEN_BET = 500;

let SLOT_INDEXES = [3, 4, 7];

// values
let currentTokenCount = 5000;
let currentTokenBet = 500;
let currentSwingBet = 25;
let currentGains = 0;


/// --- TOOLS ----



/// ----------------------------
/// --- INPUT PANEL HANDLING ---




const recalculateGains = () => {
  // I will use linear curve for now
  // TODO: Replace it with some pretty exponentional curve
  const currentGainsRate = (26 - currentSwingBet)/13;
  
  currentGains = Math.floor(currentGainsRate * currentTokenBet);
  
  GAINS_OUTPUT.value = currentGains;
};

TOKEN_BET_INPUT.addEventListener("change", (evt) => {
  mustBeBetween(evt, MIN_TOKEN_BET, currentTokenCount);

  currentTokenBet = Number(evt.target.value);
  recalculateGains();
});

SWING_BET_INPUT.addEventListener("change", (evt) => {
  mustBeBetween(evt, MIN_SWING_BET, MAX_SWING_BET);

  currentSwingBet = Number(evt.target.value);
  recalculateGains();
});



/// -------------------------------
/// --- TOKEN COUNTER HANDLING ---

const CHANGE_BY = 2;


const ITERATIONS = 50;
const INTERVAL = 50;



const gradualyChangeDisplayValue = (elementObject, oldValue, change) => {
  if(change === 0) {

    return Promise.resolve();
  }

  let iteration = 0;

  return new Promise((resolve) => {

    const intervalHandle = setInterval(() => {
      iteration++;

      let valueToDisplay = Math.round(
        oldValue + (change * iteration) / ITERATIONS
      );

      if(iteration >= ITERATIONS) {
        valueToDisplay = oldValue + change;
      }

      TOKEN_WALLET_OUTPUT.value = valueToDisplay;

      if (iteration >= ITERATIONS) {
        clearInterval(intervalHandle);
        resolve();
      }

    }, INTERVAL);

  });
};



const changeTokens = (newTokenCount) => {
  if(currentTokenCount == newTokenCount) {
    return Promise.resolve();
  }

  const startTokenCount = currentTokenCount;
  const totalDifference = newTokenCount - startTokenCount;
  let iteration = 0;

  return new Promise((resolve) => {
    const intervalHandle = setInterval(() => {

      iteration++;

      currentTokenCount = Math.round(startTokenCount + (totalDifference * iteration) / ITERATIONS);

      TOKEN_WALLET_OUTPUT.value = currentTokenCount;

      if (iteration >= ITERATIONS) {
        currentTokenCount = newTokenCount;
        TOKEN_WALLET_OUTPUT.value = currentTokenCount;

        clearInterval(intervalHandle);
        resolve();
      }

    }, INTERVAL)
  });
}

const changeTokensBy = (difference) => {

  return changeTokens(currentTokenCount + difference);
}

/// ---------------------
/// --- SPIN HANDLING ---

let currentTurn_QubitCount = -1;
let currentTurn_TargetAnswer = -1;



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


  var groverResult = run_grover(
    [currentTurnData.targetAnswer],
    currentTurnData.qubitCount,
    currentSwingBet
  );


  groverResult.then((groverFoundValue) => {
    clearInterval(intervalHandler);

    const digits = String(groverFoundValue)
      .padStart(REEL_SLOTS.length, "0")
      .slice(-REEL_SLOTS.length)
      .split("")
      .map(Number);


    SLOT_INDEXES = digits;

    REEL_SLOTS.forEach((oneSlot, index) => {
      oneSlot.innerText = digits[index];
    });



    if(groverFoundValue === currentTurnData.targetAnswer) {
      displayAnnoucment("Y.O.U  W.O.N");

      gradualyChangeDisplayValue(
        TOKEN_WALLET_OUTPUT, currentTokenCount, currentGains
      );
      currentTokenCount += currentGains;
    }
    else {
      displayAnnoucment("Y.O.U L.O.S.T");

      gradualyChangeDisplayValue(
        TOKEN_WALLET_OUTPUT, currentTokenCount, -currentTokenBet
      );
      currentTokenCount -= currentTokenBet;
    }


  })
  .catch((error) => {
    console.log(error);

    clearInterval(intervalHandler);
  })
  .finally(() => {
    isSpinning = false;
    toggleInputs(false);
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
  recalculateGains();

  TOKEN_WALLET_OUTPUT.value = currentTokenCount;

  REEL_SLOTS.forEach((oneSlot, index) => {
    oneSlot.innerText = SLOT_INDEXES[index];
  });

  clearAnnoucment();
  
  console.log("Initialized Successfuly");
};

init();


//await poll();