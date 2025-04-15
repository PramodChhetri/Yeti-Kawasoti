<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MemberLocker extends Model
{
    use HasFactory;
    protected $fillable = [
        'member_id',
        'locker_id',
        'locker_number',
        'start_date',
        'end_date',
        'locker_status',
    ];

    // Relationships
    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function locker()
    {
        return $this->belongsTo(Locker::class);
    }
}
