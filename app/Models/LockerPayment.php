<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LockerPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id', 
        'total_months', 
        'locker_charge', 
        'locker_discount', 
        'bill_number', 
        'payment_proof', 
        'active_till', 
        'paid_amount', 
        'net_amount',
        'locker_number', 
    ];

    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function invoice()
    {
        return $this->morphOne(Invoice::class, 'paymentable');
    }
}
