import { AccessControl } from "./access-controls";

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    flash: {
        message?: string;
    }
};

export interface Locker {
    id: number;
    months: number;
    price: number;
}

export interface MembershipPackage {
    id: number;
    package_name: string;
    admission_amount: number;
    monthly_amount: number;
    discount_quarterly: number;
    discount_half_yearly: number;
    discount_yearly: number;
    months: number;
    access_control_ids: string
}

export interface ExtraCredit {
    id: number;
    member_id: number;
    amount: number;
    payment_mode: string;
    remarks: string;
    created_at: string;
    updated_at: string;
}


export interface Official {
    id: number;
    name: string;
    phone: string;
    photo: string;
    gender: string;
    joining_date: string;
    is_active: boolean;
    position: string;
    status: string;
    transactions: any[]
}