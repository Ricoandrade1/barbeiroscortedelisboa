export interface Product {
    id?: string;
    name: string;
    stock: number;
    basePrice: number;
}

export interface ServiceType {
    id?: string;
    name: string;
    price: number;
}

export interface Barber {
    id?: string;
    name: string;
    services: number;
    rating: number;
    balance: number;
}
