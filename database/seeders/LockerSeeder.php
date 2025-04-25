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
            ["months" => 3, 'price' => 500],
            ["months" => 6, 'price' => 1000],
            ["months" => 12, 'price' => 2000],
            ["months" => 3, 'price' => 625],
            ["months" => 6, 'price' => 1250],
            ["months" => 12, 'price' => 2500],
            ["months" => 3, 'price' => 750],
            ["months" => 6, 'price' => 1500],
            ["months" => 12, 'price' => 3000],
            ["months" => 12, 'price' => 4000],
        ]);
    }
}
