
export interface Template {
  id: string;
  name: string;
  description: string;
  tags: string[];
  version: string;
  category: {
    industry: string;
    contentType: string;
    platform: string;
    purpose: string;
  };
}
