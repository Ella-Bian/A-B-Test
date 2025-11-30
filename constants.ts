import { ImageAsset } from './types';

// Placeholder images using Picsum
export const PRELOADED_IMAGES_A: ImageAsset[] = [
  { id: 'a1', group: 'A', url: 'https://picsum.photos/id/1/400/600' }, // Laptop/Tech
  { id: 'a2', group: 'A', url: 'https://picsum.photos/id/20/400/600' }, // Notebooks
  { id: 'a3', group: 'A', url: 'https://picsum.photos/id/48/400/600' }, // Architecture
];

export const PRELOADED_IMAGES_B: ImageAsset[] = [
  { id: 'b1', group: 'B', url: 'https://picsum.photos/id/76/400/600' }, // Minimal
  { id: 'b2', group: 'B', url: 'https://picsum.photos/id/96/400/600' }, // Abstract
  { id: 'b3', group: 'B', url: 'https://picsum.photos/id/119/400/600' }, // Metal/Texture
];

export const INSTRUCTION_PHASE_1 = "You will see an image and a word. Quickly decide if the image matches the word.";
export const INSTRUCTION_PHASE_2 = "Select all words that best describe the overall collection of images.";