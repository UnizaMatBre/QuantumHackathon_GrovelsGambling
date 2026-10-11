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

const mustBeBetween = (eventObject, min, max) => {
  const currentVal = Number(eventObject.target.value);
  
  if (currentVal < min) {
    eventObject.target.value = min;
    return;
  };

  if (currentVal > max) {
    eventObject.target.value = max;
    return;
  };
};


const difference = (a, b) => {

  return Math.abs(a - b);
};

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



const changeTokens = (newTokenCount) => {
  if(currentTokenCount == newTokenCount) {
    return;
  }

  const actualChangeBy = (currentTokenCount < newTokenCount) ? CHANGE_BY : -CHANGE_BY;
  let remainingDifference = difference(currentTokenCount, newTokenCount);
  
  // this is here to allow us wait until we are done
  const tokenChangePromise = new Promise((resolve) => {


    let intervalHandle = setInterval(() => {
      currentTokenCount += actualChangeBy;
      remainingDifference -= CHANGE_BY;
      
      if(remainingDifference <= 0) {
        currentTokenCount = newTokenCount; 
        
        clearInterval(intervalHandle);
        TOKEN_WALLET_OUTPUT.value = currentTokenCount;
        resolve();
      }

      TOKEN_WALLET_OUTPUT.value = currentTokenCount;
    }, 10);


  });

  return tokenChangePromise;
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


const toggleInputs = (state) => {
  SPIN_BUTTON.disabled = state;
  TOKEN_BET_INPUT.disabled = state;
  SWING_BET_INPUT.disabled = state;
};

let isSpinning = false;

const spin = () => {
  isSpinning = true;
  toggleInputs(true);

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
      changeTokensBy(currentGains);
    }
    else {
      displayAnnoucment("Y.O.U L.O.S.T");
      changeTokensBy(-currentTokenBet);
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

  displayAnnoucment("....")
  
  console.log("Initialized Successfuly");
};

init();


//await poll();