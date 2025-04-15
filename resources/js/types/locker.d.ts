export interface Locker {
    id: number;
    locker_number: string;
    start_date: Date;
    end_date: Date;
    locker_status: 0 | 1;
}
