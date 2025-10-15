export function generateId(): string {
  const cryptoObj = typeof globalThis !== "undefined" ? (globalThis.crypto as Crypto | undefined) : undefined;

  if (cryptoObj) {
    if (typeof cryptoObj.randomUUID === "function") {
      return cryptoObj.randomUUID();
    }

    if (typeof cryptoObj.getRandomValues === "function") {
      const bytes = cryptoObj.getRandomValues(new Uint8Array(16));
      // Adapted RFC4122 v4 implementation
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;

      const byteToHex: string[] = [];
      for (let i = 0; i < 256; i++) {
        byteToHex[i] = (i + 0x100).toString(16).substring(1);
      }

      return (
        byteToHex[bytes[0]] +
        byteToHex[bytes[1]] +
        byteToHex[bytes[2]] +
        byteToHex[bytes[3]] +
        "-" +
        byteToHex[bytes[4]] +
        byteToHex[bytes[5]] +
        "-" +
        byteToHex[bytes[6]] +
        byteToHex[bytes[7]] +
        "-" +
        byteToHex[bytes[8]] +
        byteToHex[bytes[9]] +
        "-" +
        byteToHex[bytes[10]] +
        byteToHex[bytes[11]] +
        byteToHex[bytes[12]] +
        byteToHex[bytes[13]] +
        byteToHex[bytes[14]] +
        byteToHex[bytes[15]]
      );
    }
  }

  const randomSegment = () => Math.random().toString(16).slice(2, 10);
  return `${Date.now().toString(16)}-${randomSegment()}-${randomSegment()}`;
}
