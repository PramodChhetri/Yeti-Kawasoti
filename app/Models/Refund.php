<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Refund extends Model
{
    protected $fillable = [
        'refund_amount',
        'payment_date',
        'payment_mode',
        'description',
        'member_id',
        'payment_voucher',
    ];

    public function member()
    {
        return $this->belongsTo(Member::class);
    }
}
