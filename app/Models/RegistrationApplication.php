<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegistrationApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'occupation',
        'gender',
        'marital_status',
        'date_of_birth',
        'address',
        'preferred_time',
        'membership_package_id',
        'months',
        'emergency_person_name',
        'emergency_person_phone',
        'photo',
        'payment_proof',
        'is_approved',
    ];

    public function membershipPackage()
    {
        return $this->belongsTo(MembershipPackage::class, 'membership_package_id', 'id');
    }

    /* public function getPaymentProofAttribute($value)
    {
        return "";
    } */
}
