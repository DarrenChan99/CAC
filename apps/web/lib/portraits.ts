/**
 * How each family member is drawn until real pictures exist: hair, glasses and
 * facial hair are the cues that tell people apart. Unknown voices are
 * deliberately absent — they are never given a face.
 */

export type Hair =
  | "bun"
  | "short"
  | "parted"
  | "bob"
  | "curly"
  | "long"
  | "ponytail"
  | "messy"
  | "braids"
  | "pigtails"
  | "bald";

export interface Traits {
  hair: Hair;
  glasses?: boolean;
  beard?: boolean;
  moustache?: boolean;
  child?: boolean;
}

export const portraits: Record<string, Traits> = {
  mei: { hair: "bun", glasses: true },
  wei: { hair: "bald", glasses: true, moustache: true },
  ling: { hair: "bob" },
  lisa: { hair: "curly" },
  kevin: { hair: "parted", glasses: true },
  karen: { hair: "long" },
  emily: { hair: "ponytail" },
  david: { hair: "messy" },
  jason: { hair: "short", beard: true },
  sophie: { hair: "braids" },
  ava: { hair: "pigtails", child: true },
};

export const portraitFor = (id: string): Traits | undefined => portraits[id];
