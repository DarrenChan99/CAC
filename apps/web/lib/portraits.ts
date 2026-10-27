/**
 * How each family member is drawn until real pictures exist: hair and glasses
 * are the cues that tell people apart. Unknown voices are deliberately absent —
 * they are never given a face.
 */

export type Hair =
  | "bun"
  | "short"
  | "bob"
  | "curly"
  | "long"
  | "ponytail"
  | "messy"
  | "braids"
  | "tuft"
  | "receding";

export interface Traits {
  hair: Hair;
  glasses?: boolean;
  beard?: boolean;
  older?: boolean;
  child?: boolean;
}

export const portraits: Record<string, Traits> = {
  mei: { hair: "bun", glasses: true, older: true },
  wei: { hair: "receding", glasses: true, older: true },
  ling: { hair: "bob", older: true },
  lisa: { hair: "curly" },
  kevin: { hair: "short", glasses: true },
  karen: { hair: "long" },
  emily: { hair: "ponytail" },
  david: { hair: "messy" },
  jason: { hair: "short", beard: true },
  sophie: { hair: "braids" },
  ava: { hair: "tuft", child: true },
};

export const portraitFor = (id: string): Traits | undefined => portraits[id];
