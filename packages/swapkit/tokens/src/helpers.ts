import { tokenLists } from "./index";

export function getTokenIcon(identifier: string): string | undefined {
  // Search through all lists for a matching token
  for (const list of Object.values(tokenLists)) {
    const token = list.tokens.find((t) => t.identifier === identifier);
    if (token?.logoURI) {
      return token.logoURI;
    }
  }

  return undefined;
}
