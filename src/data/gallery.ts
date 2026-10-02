import records from './gallery.json';
export type Category = 'calatoria' | 'din-carte' | 'prieteni';
export interface GalleryImage {
  category: Category;
  title: string;
  src: string;
  width: number;
  height: number;
  order: number;
}
export const categories: { id: Category; label: string }[] = [
  { id: 'calatoria', label: 'CALATORIA' },
  { id: 'din-carte', label: 'DIN CARTE' },
  { id: 'prieteni', label: 'PRIETENI' },
];
export const galleryImages = records as GalleryImage[];
