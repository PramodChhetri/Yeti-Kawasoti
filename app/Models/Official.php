<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Official extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'phone',
        'gender',
        'is_active',
        'photo',
        'joining_date',
        'position',
        'status'
    ];


    /**
     * Get the transactions associated with the official, sorted by creation date.
     */
    public function transactions()
    {
        return $this->hasMany(OfficialTransaction::class)->orderBy('created_at', 'desc');
    }
}
