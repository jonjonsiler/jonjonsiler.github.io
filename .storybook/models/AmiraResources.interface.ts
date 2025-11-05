export interface AmiraResources {
  branding: string;
  label: string;
  provider: string;
  providerDisplayName: string;
  resourceIcon: string;
  resourceId: string | null;
  resourceType: string;
  resourceUniqueId: string;
  storyIds?: string[];
  tags: string[];
  title: string;
  url: string;
  sharedSkills?: string[];
}

export interface AmiraResourcesResponse {
  label: string;
  resourceUniqueId: string;
  resourceType: string;
  tags: string[];
  storyIds?: string[];
}

export interface AmiraResourcesMetadataResponse {
  branding: string;
  provider: string;
  providerDisplayName: string;
  resourceIcon: string;
  resourceId: string | null;
  resourceType: string;
  resourceUniqueId: string;
  title: string;
  url: string;
}
