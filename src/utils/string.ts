export function maskString(str: string, length: number) {
  if (!str) return '********';
  return str.substring(0, length) + '********' + str.substring(str.length - length);
}
