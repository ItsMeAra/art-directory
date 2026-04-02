import type { CategoryValue } from '../lib/categories';

export interface Listing {
  id:          string;
  name:        string;
  category:    CategoryValue;
  tags:        string[];
  url:         string;
  description: string;
  location?:   string;
  featured:    boolean;
}
