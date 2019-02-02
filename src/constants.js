export const sovietCountryIsoCodes = [
  "ARM",
  "AZE",
  "BLR",
  "EST",
  "GEO",
  "KAZ",
  "KGZ",
  "LVA",
  "LTU",
  "MDA",
  "RUS",
  "TJK",
  "TKM",
  "UKR",
  "UZB"
];

export const colors = [
  "#feedde",
  "#fdbe85",
  "#fd8d3c",
  "#e6550d",
  "#dd6344",
  "#feedde",
  "#fdbe85",
  "#fd8d3c",
  "#e6550d",
  "#feedde",
  "#fdbe85",
  "#fd8d3c",
  "#e6550d",
  "#dd6344"
];

export const sovietLabelShift = {
  ARM: { x: -16, y: 3 },
  AZE: { x: -14, y: 7 },
  BLR: { x: -20, y: 2 },
  EST: { x: -13, y: -3 },
  GEO: { x: -18, y: 1 },
  KAZ: { x: 13, y: 15 },
  KGZ: { x: 1, y: 10 },
  LVA: { x: -15, y: -2 },
  LTU: { x: -18, y: 0 },
  MDA: { x: -18, y: 2 },
  RUS: { x: -40, y: 10 },
  TJK: { x: -6, y: 10 },
  TKM: { x: -20, y: 10 },
  UKR: { x: -23, y: 0 },
  UZB: { x: -12, y: 18 }
};

export const populationsIn1991 = [
  { name: "ARM", population: 3500000 },
  { name: "AZE", population: 7271000 },
  { name: "BLR", population: 10190000 },
  { name: "EST", population: 1568000 },
  { name: "GEO", population: 6653000 },
  { name: "KAZ", population: 16450000 },
  { name: "KGZ", population: 4464000 },
  { name: "LVA", population: 2658000 },
  { name: "LTU", population: 3700000 },
  { name: "MDA", population: 3700000 },
  { name: "TJK", population: 5400000 },
  { name: "TKM", population: 3772000 },
  { name: "UKR", population: 52000000 },
  { name: "UZB", population: 20950000 }
];

// in thousands
const russiansPerFSUState1989 = [
  { name: "ARM", population: 52 },
  { name: "AZE", population: 392 },
  { name: "BLR", population: 1432 },
  { name: "EST", population: 475 },
  { name: "GEO", population: 341 },
  { name: "KAZ", population: 6228 },
  { name: "KGZ", population: 917 },
  { name: "LVA", population: 906 },
  { name: "LTU", population: 345 },
  { name: "MDA", population: 562 },
  { name: "TJK", population: 389 },
  { name: "TKM", population: 334 },
  { name: "UKR", population: 11356 },
  { name: "UZB", population: 496 }
];

//1991 - 2000 to start
export const netFsuMigrationOne = [
  { name: "ARM", population: 200000 },
  { name: "AZE", population: 298900 },
  { name: "BLR", population: 26500, net: "in" },
  { name: "EST", population: 66400 },
  { name: "GEO", population: 358700 },
  { name: "KAZ", population: 1497400 },
  { name: "KGZ", population: 272900 },
  { name: "LVA", population: 109700 },
  { name: "LTU", population: 46600 },
  { name: "MDA", population: 78500 },
  { name: "TJK", population: 314700 },
  { name: "TKM", population: 116100 },
  { name: "UKR", population: 341600 },
  { name: "UZB", population: 605000 }
];

export const netFsuMigrationTwo = [
  { name: "ARM", population: 188700 },
  { name: "AZE", population: 120500 },
  { name: "BLR", population: 2200 },
  { name: "EST", population: 2400 },
  { name: "GEO", population: 70900 },
  { name: "KAZ", population: 347400 },
  { name: "KGZ", population: 179400 },
  { name: "LVA", population: 6800 },
  { name: "LTU", population: 2900 },
  { name: "MDA", population: 106100 },
  { name: "TJK", population: 135700 },
  { name: "TKM", population: 43200 },
  { name: "UKR", population: 261500 },
  { name: "UZB", population: 349000 }
];

// Three non-FSU countries counries recieve bhe bulk of persons
// leaving Russia:

const worldOut1995to2002inPercent = {
  germany: 59,
  israel: 25,
  us: 11
};
// migration to the far abroud consisted of 3 groups
// Germans / Russians / Jews

// 1995 -> 2002,
// 43% of net migration consisted of germans
// attracted by the generous resettlement package for the aussiedler
// and strong german economy

// Russians
// 38% of net migrants

// Jews
// 10% of net migrants

// Since 1989, Russia has net in migrants from FSU states, with exception of Belarus

// 1989 to 2002
// the largest share of Russian immigration was from 3 states that already
// had the largest Russian diaspora populations:
// Ukr: 25%
// Kazakhstan 25%
// Uzbekistan: 11%

// overall,
// Central Asia is 50%
// 3 states above 15%
// baltics 4%

// Migration Rates
// 61,500 1991
// 612,378 1994
// 71,120 in 2002
//

// 1989 -> 2002, Russians account for 58.6% immigrants to Russia
// Russia in 1989 was 81.3 percent russians
