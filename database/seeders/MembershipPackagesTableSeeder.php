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
                'package_name' => '1 Month',
                'admission_amount' => 0.00,
                'monthly_amount' => 3500.00,
                'discount_quarterly' => 0.00,
                'discount_half_yearly' => 0.00,
                'discount_yearly' => 0.00,
                'months' => 1,
                'access_control_ids' => '[]',
            ],
            [
                'package_name' => '3 Months',
                'admission_amount' => 2000.00,
                'monthly_amount' => 2500.00,
                'discount_quarterly' => 10.00,
                'discount_half_yearly' => 0.00,
                'discount_yearly' => 0.00,
                'months' => 3,
                'access_control_ids' => '[]',
            ],
            [
                'package_name' => '6 Months',
                'admission_amount' => 3000.00,
                'monthly_amount' => 2200.00,
                'discount_quarterly' => 10.00,
                'discount_half_yearly' => 15.00,
                'discount_yearly' => 0.00,
                'months' => 6,
                'access_control_ids' => '[]',
            ],
            [
                'package_name' => '1 Year',
                'admission_amount' => 4000.00,
                'monthly_amount' => 2000.00,
                'discount_quarterly' => 10.00,
                'discount_half_yearly' => 15.00,
                'discount_yearly' => 15.00,
                'months' => 12,
                'access_control_ids' => '[]',
            ],
            [
                'package_name' => 'Aerobic',
                'admission_amount' => 1000.00,
                'monthly_amount' => 2500.00,
                'discount_quarterly' => 10.00,
                'discount_half_yearly' => 15.00,
                'discount_yearly' => 15.00,
                'months' => 1200,
                'access_control_ids' => '[]',
            ],
            [
                'package_name' => 'Lifetime',
                'admission_amount' => 5000.00,
                'monthly_amount' => 2000.00,
                'discount_quarterly' => 10.00,
                'discount_half_yearly' => 15.00,
                'discount_yearly' => 15.00,
                'months' => 1200,
                'access_control_ids' => '[]',
            ]
        ]);
    }
}
