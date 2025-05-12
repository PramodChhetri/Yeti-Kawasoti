<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MembershipPackagesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('membership_packages')->insert([
            [
                'package_name' => '1 Day',
                'admission_amount' => 200.00,
                'monthly_amount' => 0.00,
                'discount_quarterly' => 0.00,
                'discount_half_yearly' => 0.00,
                'discount_yearly' => 0.00,
                'months' => 0,
                'access_control_ids' => '[]',
            ],
            [
                'package_name' => '1 Month(Non Admission)',
                'admission_amount' => 4000.00,
                'monthly_amount' => 0.00,
                'discount_quarterly' => 0.00,
                'discount_half_yearly' => 0.00,
                'discount_yearly' => 0.00,
                'months' => 1,
                'access_control_ids' => '[]',
            ],
            [
                'package_name' => 'Lifetime',
                'admission_amount' => 3000.00,
                'monthly_amount' => 2000.00,
                'discount_quarterly' => 16.67,
                'discount_half_yearly' => 16.67,
                'discount_yearly' => 20.83,
                'months' => 1200,
                'access_control_ids' => '[]',
            ],
        ]);
    }
}
