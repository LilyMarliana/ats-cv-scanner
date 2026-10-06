export interface JDTemplate {
  id: string;
  positionName: string;
  jdText: string;
  isPreset: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateListResponse {
  success: boolean;
  message: string;
  data?: JDTemplate[];
}

export interface TemplateSingleResponse {
  success: boolean;
  message: string;
  data?: JDTemplate;
}