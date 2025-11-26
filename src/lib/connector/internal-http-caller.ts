import { cleanObj, generateNonce, validateNonce } from '@an-oct/vani-kit';

const defaultHeaders: Record<string, string> = {};

export function setDefaultHeaders(headers: Record<string, string>) {
  Object.assign(defaultHeaders, headers);
}

export function call(
  url: string,
  { uidPrefix, ...options }: { uidPrefix?: string } & RequestInit = {}
) {
  const prefix = uidPrefix ?? 'http-caller';
  const uid = `${prefix}-${Math.random().toString(36).substring(2, 15)}-${Date.now()}`;
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...generateHeaders(uid),
      ...defaultHeaders,
      ...options.headers,
    },
  });
}

function generateHeaders(uid: string) {
  const timestamp = Date.now();
  const nonce = generateNonce(uid, timestamp);
  const valid = validateNonce(nonce, uid, timestamp);
  if (!valid) {
    throw new Error('Invalid nonce');
  }
  return cleanObj({
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'x-uniq': uid,
    'x-timestamp': timestamp.toString(),
    'x-nonce': nonce,
  }) as Record<string, string>;
}
