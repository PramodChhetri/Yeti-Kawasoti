import { MembershipPackage } from ".";
import { Locker } from "./locker";

interface Payment {
    id: number;
    member_id: number;
    admission_fees?: string;
    monthly_fees?: string;
    total_months: number;
    total_monthly_fees?: string;
    extra_discount?: string;
    locker_months?: number;
    locker_charge?: string;
    locker_discount?: string;
    paid_amount: string;
    refund_amount?: string;
    net_amount: string;
    package_discount?: string;
    payment_date: string;
    bill_number: string;
    active_till: string;
    payment_proof?: string | null;
    is_approved: number;
    created_at: string;
    updated_at: string;
    payment_mode: string;
    locker_number?: string;
    type: 'entry' | 'renewal' | 'locker';
}

interface Member {
    id: number;
    name: string;
    father_name: string;
    date_of_birth: Date;
    phone: string;
    gender: 'male' | 'female' | 'other';
    marital_status: 'single' | 'married';
    preferred_time: string;
    address: string;
    photo: string | File;
    membership_package_id: number;
    membership_package: MembershipPackage;
    payment_mode: string;
    payment_proof: string | null;
    bill_number: number;
    card_number: number;
    start_date: Date;
    end_date: Date;
    payment_expiry_date: Date;
    total_payment: string;
    credit: number;
    is_approved: number;
    status: string;
    remarks: string;
    created_at: string;
    updated_at: string;
    payments: any[]; // You might want to define this more clearly later
    extra_credits: any[]; // You might want to define this more clearly later
    all_payments: Payment[]; // New field for all types of payments
    occupation: string;
    emergency_person_name: string;
    emergency_person_phone: string;
    locker?: Locker;
    active_locker?: Locker;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData {
    current_page: number;
    data: Member[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export {
    Member,
    PaginatedData,
    PaginationLink,
    Payment, // Export Payment interface for further usage if necessary
}
