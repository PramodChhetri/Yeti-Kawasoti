<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MembershipPackage extends Model
{
    use HasFactory;


    public $guarded = [];

    protected $casts = [
        'access_control_ids' => 'array',
    ];


    public function getAccessControlIdsAttribute($value)
    {
        return $value ?? [];
    }


    public function members()
    {
        return $this->hasMany(Member::class);
    }

    public function accessControls()
    {
        return AccessControl::whereIn('id', $this->access_control_ids)->get();
    }
}
