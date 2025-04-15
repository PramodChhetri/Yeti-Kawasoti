<?php

namespace App;

use App\Models\Invoice;

trait GeneratesInvoice
{
    /**
     * Boot the trait to generate an invoice number when a payment is created.
     */
    public static function bootGeneratesInvoice()
    {
        static::created(function ($model) {
            $model->createInvoice();
        });
    }

    /**
     * Create an invoice for the payment.
     */
    public function createInvoice()
    {
        // Check again before creating, ensuring it’s not already created
        if (!$this->invoice()->exists()) {
            Invoice::create([
                'member_id' => $this->member_id ?? null,
                'paymentable_id' => $this->id,
                'paymentable_type' => static::class,
                'invoice_number' => Invoice::generateInvoiceNumber(), // Reuse the existing logic in the Invoice model
            ]);
        }
    }
}
