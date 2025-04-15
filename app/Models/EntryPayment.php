<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EntryPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id', 
        'admission_fees', 
        'monthly_fees', 
        'total_months', 
        'total_monthly_fees', 
        'extra_discount', 
        'locker_months', 
        'locker_charge', 
        'locker_discount', 
        'paid_amount', 
        'net_amount', 
        'package_discount', 
        'payment_date', 
        'bill_number', 
        'active_till', 
        'payment_proof',
        'payment_mode'
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
