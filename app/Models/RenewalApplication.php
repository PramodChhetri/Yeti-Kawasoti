<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class RenewalApplication extends Model
{
    use HasFactory;

    protected $fillable = ['member_id', 'months', 'payment_proof', 'is_approved'];
    protected $appends = ['payment_proof_path'];
    // Relationship to Member
    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function membershipPackage()
    {
        return $this->belongsTo(MembershipPackage::class, 'membership_package_id', 'id');
    }


    protected function getPaymentProofPathAttribute()
    {
        return Storage::url($this->payment_proof);
    }
}
