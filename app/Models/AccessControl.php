<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccessControl extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'uuid',
        'ip_address',
        'username',
        'password',
        'port',
        'description',
    ];
}
