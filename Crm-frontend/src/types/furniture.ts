export interface FurnitureProduct {
  id: number;
  name: string;
  category: string;
  price: string;
  description: string;
  image: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface ContactInfo {
  type: string;
  icon: string;
  label: string;
  value: string;
}

export interface Testimonial {
  id: number;
  name: string;
  location: string;
  review: string;
}

export interface Feature {
  id: number;
  title: string;
  description: string;
  icon: string;
}
