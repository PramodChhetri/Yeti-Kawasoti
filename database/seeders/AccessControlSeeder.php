<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AccessControlSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        DB::table('access_controls')->insert([
            [
                'name' => 'Kshetrapur',
                'ip_address' => '182.93.82.10',
                'username' => 'admin',
                'password' => 'chitwangym@0909',
                'port' => '80',
                'description' => 'Gym1',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Madi Gym',
                'ip_address' => '182.93.65.140',
                'username' => 'admin',
                'password' => 'Nexis@2081',
                'port' => '80',
                'description' => 'Gym 2',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Device C',
                'ip_address' => '182.93.82.142',
                'username' => 'admin',
                'password' => 'Nexis@2081',
                'port' => '80',
                'description' => 'Data center VPN',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
