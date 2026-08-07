export interface IClient {
  clientId: string;
  name: string;
  email: string;
  label: string;
  category: string;
  tag: string;
  vendorName: string;
  vendorId: string;
  isActive: boolean;
  createdAt: string;
}

export interface IClientDetail {
  clientId: string;
  name: string;
  email: string;
  label: string;
  category: string;
  tag: string;
  vendor: {
    vendorId: string;
    name: string;
  };
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateClientPayload {
  name: string;
  email: string;
  label?: string;
  category?: string;
  tag?: string;
  vendor: string;
}

export interface IUpdateClientPayload {
  name?: string;
  email?: string;
  label?: string;
  category?: string;
  tag?: string;
}
