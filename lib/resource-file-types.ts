export const RESOURCE_FILE_CATEGORIES = [
  "Lease",
  "Notice",
  "Template",
  "Checklist",
  "Guide",
  "Other",
] as const;

export type ResourceFileCategory = (typeof RESOURCE_FILE_CATEGORIES)[number];

export interface ResourceFileItem {
  id: string;
  title: string;
  description: string;
  category: ResourceFileCategory;
  url: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}
