<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = ['member_id', 'invoice_number', 'paymentable_id', 'paymentable_type'];

    public static function boot()
    {
        parent::boot();

        static::creating(function ($invoice) {
            $invoice->invoice_number = self::generateInvoiceNumber();
        });
    }

    /**
     * Generate a unique invoice number.
     *
     * @return string
     */
    public static function generateInvoiceNumber()
    {
        $lastInvoice = self::orderBy('id', 'desc')->first();
        $lastNumber = $lastInvoice ? (int) substr($lastInvoice->invoice_number, -6) : 0;
        $newNumber = str_pad($lastNumber + 1, 6, '0', STR_PAD_LEFT);

        return 'INV-' . $newNumber;
    }

    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function paymentable()
    {
        return $this->morphTo();
    }
}
