export default (what: string, arrayOfStrings: string[]) => {
  if(!Array.isArray(arrayOfStrings)) {
    throw new Error('includesOneOf only accepts an array');
  }

  return arrayOfStrings.some(str => what.includes(str));
};
