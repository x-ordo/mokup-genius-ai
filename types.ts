export enum AppView {
  MOCKUP = 'MOCKUP',
  GENERATE = 'GENERATE',
  EDIT = 'EDIT'
}

export interface MockupProduct {
  id: string;
  name: string;
  url: string;
  logoArea: {
    top: string;
    left: string;
    width: string;
    height: string;
    rotation?: string;
  };
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  createdAt: number;
}

export type ImageSize = '1K' | '2K' | '4K';
