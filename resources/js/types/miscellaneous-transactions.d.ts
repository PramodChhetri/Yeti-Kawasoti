export interface PaginatedMiscellaneousTransactions {
    current_page: number
    data: MiscellaneousTransaction[]
    first_page_url: string
    from: number
    last_page: number
    last_page_url: string
    links: Link[]
    next_page_url: any
    path: string
    per_page: number
    prev_page_url: any
    to: number
    total: number
}

export interface MiscellaneousTransaction {
    id: number
    member_id: any
    name: string
    transaction_type: string
    description: string
    total_amount: string
    paid_amount: string
    payment_date: string
    payment_mode: string
    bill_number: any
    remarks: any
    created_at: string
    updated_at: string
    invoice?: Invoice
}

export interface Invoice {
    id: number
    member_id: any
    invoice_number: string
    paymentable_type: string
    paymentable_id: number
    created_at: string
    updated_at: string
}

export interface Link {
    url?: string
    label: string
    active: boolean
}
