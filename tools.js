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

export {
    mustBeBetween,
    difference
};