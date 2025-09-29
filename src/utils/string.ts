export function maskString(str: string, length: number) {
  return str.substring(0, length) + '********' + str.substring(str.length - length);
}
