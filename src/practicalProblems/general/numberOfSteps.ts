function numberOfSteps(value: number) {
  if (value <= 2) return value;

  let steps = 0;
  while (value) {
    if (isEven(value)) {
      value /= 2;
    } else {
      value -= 1;
    }
    steps++;
  }

  return steps;
}

function isEven(value: number) {
  return value % 2 === 0;
}

export default numberOfSteps;
