import hoodieImg from '../assets/images/product_hoodie_cyber_1791891335053.jpg';
import cargoImg from '../assets/images/product_cargo_tech_1791891336522.jpg';
import bomberImg from '../assets/images/product_jacket_bomber_1791891336245.jpg';
import heroImg from '../assets/images/hero_velnix_campaign_1791891336301.jpg';

export const STATIC_IMAGES = {
  hoodie: hoodieImg,
  cargo: cargoImg,
  bomber: bomberImg,
  trench: heroImg,
  hero: heroImg,
};

export function resolveImageUrl(url: string | undefined): string {
  if (!url) return heroImg;
  
  if (url.includes('product_hoodie_cyber') || url.includes('prod-1')) {
    return hoodieImg;
  }
  if (url.includes('product_cargo_tech') || url.includes('prod-2')) {
    return cargoImg;
  }
  if (url.includes('product_jacket_bomber') || url.includes('prod-3')) {
    return bomberImg;
  }
  if (url.includes('hero_velnix_campaign') || url.includes('prod-4') || url.includes('trench')) {
    return heroImg;
  }

  // If it's an external URL (http / https), return as-is
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }

  return url;
}
