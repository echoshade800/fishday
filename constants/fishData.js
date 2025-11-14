/**
 * Fish Encyclopedia Data
 * Contains all fish species with names, rarity, and placeholder images
 */

export const FISH_IMAGES = {
  'Capelin': 'https://dzdbhsix5ppsc.cloudfront.net/monster/fishgame/fishphoto/Capelin.png',
  'Violet Scaled Fish': 'https://dzdbhsix5ppsc.cloudfront.net/monster/fishgame/fishphoto/VioletScaledFish.png',
  'Blueback Wrasse': 'https://dzdbhsix5ppsc.cloudfront.net/monster/fishgame/fishphoto/BluebackWrasse.png',
  'Purple Sandtip Fish': 'https://dzdbhsix5ppsc.cloudfront.net/monster/fishgame/fishphoto/PurpleSandtipFish.png',
  'Large Prawns': 'https://dzdbhsix5ppsc.cloudfront.net/monster/fishgame/fishphoto/largeprawns.png',
  'Pearl Capelin': 'https://dzdbhsix5ppsc.cloudfront.net/monster/fishgame/fishphoto/PearlCapelin.png',
  'Starry Sparrowtail Fish': 'https://dzdbhsix5ppsc.cloudfront.net/monster/fishgame/fishphoto/StarrySparrowtailFish.png',
  'Black Tiger Shrimp': 'https://dzdbhsix5ppsc.cloudfront.net/monster/fishgame/fishphoto/BlackTigerShrimp.png',
  'Golden Bream': 'https://dzdbhsix5ppsc.cloudfront.net/monster/fishgame/fishphoto/GoldenBream.png',
  'Dream Fairyfish': 'https://dzdbhsix5ppsc.cloudfront.net/monster/fishgame/fishphoto/DreamFairyfish.png',
  'Bluefin Flower Fish': 'https://dzdbhsix5ppsc.cloudfront.net/monster/fishgame/fishphoto/BluefinFlowerFish.png',
  'Bluefin Fish': 'https://dzdbhsix5ppsc.cloudfront.net/monster/fishgame/fishphoto/BluefinFish.png',
  'Mullet': 'https://dzdbhsix5ppsc.cloudfront.net/monster/fishgame/fishphoto/Mullet.png',
  'Blue Moon Squid': 'https://dzdbhsix5ppsc.cloudfront.net/monster/fishgame/fishphoto/BlueMoonSquid.png',
  'Giant Sailfish': 'https://dzdbhsix5ppsc.cloudfront.net/monster/fishgame/fishphoto/GiantSailfish.png',
  'Seabream': 'https://dzdbhsix5ppsc.cloudfront.net/monster/fishgame/fishphoto/Seabream.png',
};

export const FISH_DATA = [
  { id: 1, name: 'Starry Sparrowtail Fish', rarity: 4, imagePlaceholderUrl: FISH_IMAGES['Starry Sparrowtail Fish'] },
  { id: 2, name: 'Purple Sandtip Fish', rarity: 3, imagePlaceholderUrl: FISH_IMAGES['Purple Sandtip Fish'] },
  { id: 3, name: 'Bluefin Flower Fish', rarity: 3, imagePlaceholderUrl: FISH_IMAGES['Bluefin Flower Fish'] },
  { id: 4, name: 'Blueback Wrasse', rarity: 2, imagePlaceholderUrl: FISH_IMAGES['Blueback Wrasse'] },
  { id: 5, name: 'Blue Moon Squid', rarity: 5, imagePlaceholderUrl: FISH_IMAGES['Blue Moon Squid'] },
  { id: 6, name: 'Giant Sailfish', rarity: 5, imagePlaceholderUrl: FISH_IMAGES['Giant Sailfish'] },
  { id: 7, name: 'Dream Fairyfish', rarity: 4, imagePlaceholderUrl: FISH_IMAGES['Dream Fairyfish'] },
  { id: 8, name: 'Capelin', rarity: 2, imagePlaceholderUrl: FISH_IMAGES['Capelin'] },
  { id: 9, name: 'Mullet', rarity: 2, imagePlaceholderUrl: FISH_IMAGES['Mullet'] },
  { id: 10, name: 'Bluefin Fish', rarity: 3, imagePlaceholderUrl: FISH_IMAGES['Bluefin Fish'] },
  { id: 11, name: 'Black Tiger Shrimp', rarity: 3, imagePlaceholderUrl: FISH_IMAGES['Black Tiger Shrimp'] },
  { id: 12, name: 'Seabream', rarity: 3, imagePlaceholderUrl: FISH_IMAGES['Seabream'] },
  { id: 13, name: 'Golden Bream', rarity: 4, imagePlaceholderUrl: FISH_IMAGES['Golden Bream'] },
  { id: 14, name: 'Pearl Capelin', rarity: 3, imagePlaceholderUrl: FISH_IMAGES['Pearl Capelin'] },
  { id: 15, name: 'Violet Scaled Fish', rarity: 3, imagePlaceholderUrl: FISH_IMAGES['Violet Scaled Fish'] },
  { id: 16, name: 'Large Prawns', rarity: 2, imagePlaceholderUrl: FISH_IMAGES['Large Prawns'] },
];

// Helper to get fish by rarity
export const getFishByRarity = (rarity) => {
  return FISH_DATA.filter(fish => fish.rarity === rarity);
};

// Helper to get random fish based on rarity distribution
export const getRandomFish = () => {
  // Rarity distribution: 2★ = 40%, 3★ = 35%, 4★ = 20%, 5★ = 5%
  const rand = Math.random();
  let targetRarity;

  if (rand < 0.4) targetRarity = 2;
  else if (rand < 0.75) targetRarity = 3;
  else if (rand < 0.95) targetRarity = 4;
  else targetRarity = 5;

  const fishOfRarity = getFishByRarity(targetRarity);
  return fishOfRarity[Math.floor(Math.random() * fishOfRarity.length)];
};

// Render stars for rarity display
export const renderStars = (rarity) => {
  return '★'.repeat(rarity);
};
