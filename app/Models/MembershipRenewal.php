<?php

namespace App\Models;

use App\GeneratesInvoice;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MembershipRenewal extends Model
{
    use HasFactory, GeneratesInvoice;

    protected $fillable = [
        'member_id', 
        'membership_package_id', 
        'monthly_fees', 
        'total_months', 
        'paid_amount', 
        'extra_discount', 
        'payment_mode',
        'package_discount', 
        'bill_number', 
        'payment_date', 
        'payment_proof', 
        'active_till', 
        'net_amount'
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
