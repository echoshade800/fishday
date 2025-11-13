/**
 * Fish Encyclopedia Data
 * Contains all fish species with names, rarity, and placeholder images
 */

export const FISH_DATA = [
  { id: 1, name: 'Starry Sparrowtail Fish', rarity: 4, imagePlaceholderUrl: 'https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Starry+Sparrowtail' },
  { id: 2, name: 'Purple Sandtip Fish', rarity: 3, imagePlaceholderUrl: 'https://via.placeholder.com/300x200/9B59B6/FFFFFF?text=Purple+Sandtip' },
  { id: 3, name: 'Bluefin Flower Fish', rarity: 3, imagePlaceholderUrl: 'https://via.placeholder.com/300x200/3498DB/FFFFFF?text=Bluefin+Flower' },
  { id: 4, name: 'Blueback Wrasse', rarity: 2, imagePlaceholderUrl: 'https://via.placeholder.com/300x200/5DADE2/FFFFFF?text=Blueback+Wrasse' },
  { id: 5, name: 'Blue Moon Squid', rarity: 5, imagePlaceholderUrl: 'https://via.placeholder.com/300x200/1E3A8A/FFFFFF?text=Blue+Moon+Squid' },
  { id: 6, name: 'Giant Sailfish', rarity: 5, imagePlaceholderUrl: 'https://via.placeholder.com/300x200/0C4A6E/FFFFFF?text=Giant+Sailfish' },
  { id: 7, name: 'Dream Fairyfish', rarity: 4, imagePlaceholderUrl: 'https://via.placeholder.com/300x200/EC4899/FFFFFF?text=Dream+Fairyfish' },
  { id: 8, name: 'Capelin', rarity: 2, imagePlaceholderUrl: 'https://via.placeholder.com/300x200/94A3B8/FFFFFF?text=Capelin' },
  { id: 9, name: 'Mullet', rarity: 2, imagePlaceholderUrl: 'https://via.placeholder.com/300x200/64748B/FFFFFF?text=Mullet' },
  { id: 10, name: 'Bluefin Fish', rarity: 3, imagePlaceholderUrl: 'https://via.placeholder.com/300x200/2563EB/FFFFFF?text=Bluefin+Fish' },
  { id: 11, name: 'Black Tiger Shrimp', rarity: 3, imagePlaceholderUrl: 'https://via.placeholder.com/300x200/DC2626/FFFFFF?text=Black+Tiger+Shrimp' },
  { id: 12, name: 'Seabream', rarity: 3, imagePlaceholderUrl: 'https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Seabream' },
  { id: 13, name: 'Golden Bream', rarity: 4, imagePlaceholderUrl: 'https://via.placeholder.com/300x200/FCD34D/FFFFFF?text=Golden+Bream' },
  { id: 14, name: 'Pearl Capelin', rarity: 3, imagePlaceholderUrl: 'https://via.placeholder.com/300x200/E0E7FF/FFFFFF?text=Pearl+Capelin' },
  { id: 15, name: 'Violet Scaled Fish', rarity: 3, imagePlaceholderUrl: 'https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=Violet+Scaled' },
  { id: 16, name: 'Large Prawns', rarity: 2, imagePlaceholderUrl: 'https://via.placeholder.com/300x200/F97316/FFFFFF?text=Large+Prawns' },
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
