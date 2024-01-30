// Add as many 0 as needed as prefix
export const addPrefixZeros = (num, digits) => {
  return parseInt(num) ? num.padStart(digits, 0) : num
}