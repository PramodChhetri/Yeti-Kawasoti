<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExtraCredit extends Model
{
    use HasFactory;

    public $guarded = [];

    public function member()
    {
        return $this->belongsTo(Member::class);
    }
}
