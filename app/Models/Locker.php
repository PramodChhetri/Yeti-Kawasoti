<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Locker extends Model
{
    use HasFactory;

    protected $fillable = ['months', 'price'];

    // Many-to-Many relationship to members through the member_lockers table
    public function members()
    {
        return $this->belongsToMany(Member::class, 'member_lockers')
            ->withPivot('locker_number', 'start_date', 'end_date', 'locker_status');
    }
}
