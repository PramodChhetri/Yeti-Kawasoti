<?php

namespace App\Models;

use App\GeneratesInvoice;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory, GeneratesInvoice;

    protected $fillable = [
        'member_id',
        'name',
        'transaction_type',
        'description',
        'total_amount',
        'paid_amount',
        'payment_date',
        'payment_mode',
        'bill_number',
        'description',
    ];

    protected static function boot()
    {
        parent::boot();
        // Automatically create an invoice after a transaction is created
        static::created(function ($transaction) {
            $transaction->createInvoice();
        });
    }

    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function invoice()
    {
        return $this->morphOne(Invoice::class, 'paymentable');
    }
}
