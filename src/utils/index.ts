export function capitalizeFirstLetter(str: string) {
  // if (str.trim() == '') return str
  const newStr = str.charAt(0).toUpperCase() + str.slice(1)
  return newStr
}