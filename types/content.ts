export interface PageContent {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_description?: string | null;
  order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description?: string | null;
  image_url: string;
  category: string;
  order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}
