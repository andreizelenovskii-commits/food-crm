const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

const LATIN_TO_CYRILLIC_ENTRIES: Array<[string, string]> = [
  ["sch", "щ"],
  ["yo", "е"],
  ["zh", "ж"],
  ["kh", "х"],
  ["ts", "ц"],
  ["ch", "ч"],
  ["sh", "ш"],
  ["yu", "ю"],
  ["ya", "я"],
  ["ye", "е"],
  ["a", "а"],
  ["b", "б"],
  ["v", "в"],
  ["g", "г"],
  ["d", "д"],
  ["e", "е"],
  ["z", "з"],
  ["i", "и"],
  ["y", "й"],
  ["k", "к"],
  ["l", "л"],
  ["m", "м"],
  ["n", "н"],
  ["o", "о"],
  ["p", "п"],
  ["r", "р"],
  ["s", "с"],
  ["t", "т"],
  ["u", "у"],
  ["f", "ф"],
  ["h", "х"],
  ["c", "к"],
];

const EN_TO_RU_KEYBOARD: Record<string, string> = {
  q: "й",
  w: "ц",
  e: "у",
  r: "к",
  t: "е",
  y: "н",
  u: "г",
  i: "ш",
  o: "щ",
  p: "з",
  "[": "х",
  "]": "ъ",
  a: "ф",
  s: "ы",
  d: "в",
  f: "а",
  g: "п",
  h: "р",
  j: "о",
  k: "л",
  l: "д",
  ";": "ж",
  "'": "э",
  z: "я",
  x: "ч",
  c: "с",
  v: "м",
  b: "и",
  n: "т",
  m: "ь",
  ",": "б",
  ".": "ю",
  "`": "е",
};

const RU_TO_EN_KEYBOARD = Object.fromEntries(
  Object.entries(EN_TO_RU_KEYBOARD).map(([english, russian]) => [russian, english]),
);

function addVariant(variants: Set<string>, value: string) {
  const normalized = normalizeSearchText(value);

  if (normalized) {
    variants.add(normalized);
    variants.add(compactSearchText(normalized));
  }
}

function convertByMap(value: string, map: Record<string, string>) {
  return Array.from(value)
    .map((char) => map[char] ?? char)
    .join("");
}

function cyrillicToLatin(value: string) {
  return Array.from(value)
    .map((char) => CYRILLIC_TO_LATIN[char] ?? char)
    .join("");
}

function latinToCyrillic(value: string) {
  let result = "";

  for (let index = 0; index < value.length; ) {
    const entry = LATIN_TO_CYRILLIC_ENTRIES.find(([latin]) => value.startsWith(latin, index));

    if (entry) {
      result += entry[1];
      index += entry[0].length;
    } else {
      result += value[index];
      index += 1;
    }
  }

  return result;
}

function getLatinSoundVariants(value: string) {
  const variants = new Set<string>([value]);

  for (const variant of Array.from(variants)) {
    variants.add(variant.replace(/oo/g, "u"));
    variants.add(variant.replace(/like/g, "layk"));
    variants.add(variant.replace(/c/g, "k"));
    variants.add(variant.replace(/ph/g, "f"));
    variants.add(variant.replace(/w/g, "v"));
  }

  for (const variant of Array.from(variants)) {
    variants.add(variant.replace(/oo/g, "u").replace(/like/g, "layk"));
  }

  return Array.from(variants);
}

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/и\u0306/gi, "й")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function compactSearchText(value: string) {
  return normalizeSearchText(value).replace(/\s+/g, "");
}

export function getSmartSearchVariants(value: string) {
  const variants = new Set<string>();
  const normalized = normalizeSearchText(value);

  addVariant(variants, normalized);
  addVariant(variants, cyrillicToLatin(normalized));
  addVariant(variants, latinToCyrillic(normalized));
  addVariant(variants, convertByMap(normalized, EN_TO_RU_KEYBOARD));
  addVariant(variants, convertByMap(normalized, RU_TO_EN_KEYBOARD));
  for (const latinVariant of getLatinSoundVariants(cyrillicToLatin(normalized))) {
    addVariant(variants, latinVariant);
  }

  return Array.from(variants);
}

export function matchesSmartSearch(value: string | Array<string | null | undefined>, query: string) {
  const queryVariants = getSmartSearchVariants(query);

  if (queryVariants.length === 0) {
    return true;
  }

  const haystackVariants = getSmartSearchVariants(
    Array.isArray(value) ? value.filter(Boolean).join(" ") : value,
  );
  const queryTokens = queryVariants.flatMap((variant) => variant.split(" ").filter(Boolean));

  return (
    queryVariants.some((variant) =>
      haystackVariants.some((haystack) => haystack.includes(variant)),
    ) ||
    queryTokens.every((token) =>
      haystackVariants.some((haystack) => haystack.includes(token)),
    )
  );
}
