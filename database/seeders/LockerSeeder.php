<?php

namespace Database\Seeders;

use App\Models\Locker;
use Illuminate\Database\Seeder;

class LockerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Locker::insert([
            ["months" => 1, 'price' => 300],
            ["months" => 3, 'price' => 800],
            ["months" => 6, 'price' => 1500],
            ["months" => 12, 'price' => 3000]
        ]);
    }
}
