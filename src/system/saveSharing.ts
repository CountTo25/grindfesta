function bytesToBinary(bytes: Uint8Array): string {
  const chunkSize = 0x8000;
  let binary = "";

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }

  return binary;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function encodeSave(save: unknown): string {
  const json = JSON.stringify(save);
  const bytes = new TextEncoder().encode(json);
  return btoa(bytesToBinary(bytes));
}

export function decodeSave(encodedSave: string): Record<string, unknown> {
  const compactSave = encodedSave.replace(/\s/g, "");
  if (!compactSave) throw new Error("Paste a save code first.");

  let binary: string;
  try {
    binary = atob(compactSave);
  } catch {
    throw new Error("That is not a valid exported save code.");
  }

  let json: string;
  try {
    const bytes = Uint8Array.from(binary, (character) =>
      character.charCodeAt(0),
    );
    json = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error("That save code contains unreadable data.");
  }

  let save: unknown;
  try {
    save = JSON.parse(json);
  } catch {
    throw new Error("That save code does not contain a valid save.");
  }

  if (!isRecord(save) || !isRecord(save.global) || !isRecord(save.run)) {
    throw new Error("That save code is missing required game data.");
  }

  return save;
}
