<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $fillable = [
        'name',
        'expense_type',
        'description',
        'expense_amount',
        'payment_date',
        'payment_mode',
        'payment_voucher',
    ];
}
