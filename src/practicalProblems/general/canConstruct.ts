function canConstruct(random: string, magazine: string): boolean {
  let index = 0;
  let isFound;
  while (
    index < magazine.length &&
    !(isFound = magazine.slice(index, random.length) === random)
  )
    index++;
  return isFound || false;
}

export default canConstruct;
