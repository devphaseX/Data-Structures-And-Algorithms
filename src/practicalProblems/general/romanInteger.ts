const Roman = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};

function romanToInt(romanValue: string) {
  let lastSymbol: keyof typeof Roman;
  romanValue = romanValue.toUpperCase();
  return romanValue.split('').reduceRight((total, romanSymbol) => {
    if (!(romanSymbol in Roman)) {
      throw new TypeError('');
    }

    let symbol = romanSymbol as keyof typeof Roman;
    try {
      return lastSymbol && Roman[lastSymbol] > Roman[symbol]
        ? total - Roman[symbol]
        : total + Roman[symbol];
    } finally {
      lastSymbol = symbol;
    }
  }, 0);
}

export default romanToInt;
