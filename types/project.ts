export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url?: string | null;
  status: string;
  order: number;
  created_at: string;
  updated_at: string;
}
