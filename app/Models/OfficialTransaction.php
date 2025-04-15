<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OfficialTransaction extends Model
{
    protected $fillable = [
        'official_id',
        'name',
        'transaction_type',
        'description',
        'amount',
        'transaction_date',
        'voucher_number',
    ];

    public function official()
    {
        return $this->belongsTo(Official::class);
    }
}
