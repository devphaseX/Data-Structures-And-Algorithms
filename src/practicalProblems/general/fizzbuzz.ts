function fizzBuzzMap(n: number) {
  if (!(n > 0 && n < 10e5)) {
    throw new RangeError(
      `FizzBuzz only operate withing the range of 1 - ${10e5} `
    );
  }

  let valueMap: Array<[number, string]> = [
    [3, 'Fizz'],
    [5, 'Buzz'],
  ];

  return Array.from(
    { length: n } as Array<number>,
    (_, n) =>
      valueMap.map((v) => ((n + 1) % v[0] === 0 ? v[1] : null)).join('') ||
      (n + 1).toString()
  );
}

export default fizzBuzzMap;
