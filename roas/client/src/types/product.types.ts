export interface IProduct {
  productId: string;
  name: string;
  description: string;
  images: string[];
  vendorName: string;
  vendorId: string;
  isActive: boolean;
  createdAt: string;
}

export interface IProductDetail {
  productId: string;
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

export interface ICreateProductPayload {
  name: string;
  description?: string;
  images?: string[];
  vendor: string;
}

export interface IUpdateProductPayload {
  name?: string;
  description?: string;
  images?: string[];
}
