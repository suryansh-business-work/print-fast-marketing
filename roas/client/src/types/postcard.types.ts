export interface IPostcard {
  postcardId: string;
  name: string;
  description: string;
  images: string[];
  vendorName: string;
  vendorId: string;
  isActive: boolean;
  createdAt: string;
}

export interface IPostcardDetail {
  postcardId: string;
  name: string;
  description: string;
  images: string[];
  vendor: {
    vendorId: string;
    name: string;
  };
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreatePostcardPayload {
  name: string;
  description?: string;
  images?: string[];
  vendor: string;
}

export interface IUpdatePostcardPayload {
  name?: string;
  description?: string;
  images?: string[];
}
