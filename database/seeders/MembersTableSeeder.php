<?php

namespace Database\Seeders;

use App\Models\Member;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MembersTableSeeder extends Seeder
{
    public function run()
    {
        // Path to the CSV file
        $filePath = public_path('members.csv');

        // Temporarily disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Truncate the 'members' table
        DB::table('members')->truncate();

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');


        // Open the file and read its contents
        if (($handle = fopen($filePath, 'r')) !== false) {
            $header = fgetcsv($handle, 1000, ',');

            $header[0] = 'id';

            $map = [];

            // Loop through each row of the CSV file
            while (($row = fgetcsv($handle, 1000, ',')) !== false) {
                // Create an associative array for each row
                $rowData = array_combine($header, $row);


                // Map the CSV fields to the database fields
                $memberData = [
                    'id' => $rowData['id'],
                    'name' => $rowData['name'],
                    'gender' => strtolower($rowData['gender']),
                    'phone' => $rowData['phone'],
                    'occupation' => 'others',
                    'address' => $rowData['address'],
                    'membership_package_id' => $this->mapMembershipPackage($rowData['membership_package_id']),
                    'start_date' => Carbon::parse($rowData['start_date'])->format('Y-m-d'),
                    'end_date' => Carbon::parse($rowData['end_date'])->format('Y-m-d'),
                    'payment_expiry_date' => Carbon::parse($rowData['payment_expiry_date'])->format('Y-m-d'),
                    'total_payment' => $rowData['total_payment'], // Default for now, can be updated
                    'credit' => 0,
                    'is_approved' => 1, // Assuming all members are approved
                    'marital_status' => $rowData['marital_status'], // Can be changed if present in data
                    'preferred_time' => $rowData['preferred_time'],
                    'on_device' => 0, // Default value
                    'date_of_birth' => Carbon::parse($rowData['date_of_birth'])->format('Y-m-d'), // Default if not provided
                    'is_approved' => 1,
                    'photo' => 'storage/members/' . $rowData['id'] . '.jpg',
                    'emergency_person_name' => $rowData['father_name'],
                    'remarks' => $rowData['remarks'],
                ];
                //Log::info($memberData['id']);

                $map[] = (int) $memberData['id'];

                // Insert or update the member in the database
                DB::table('members')->insert($memberData);
            }

            Log::info($map);

            // Close the file after reading
            fclose($handle);
        }
    }

    // Map membership packages based on the table you've provided
    private function mapMembershipPackage($packageName)
    {
        $packages = [
            '1' => 1,
            '2' => 2,
            '3' => 3,
            '4' => 4,
            '5' => 5,
            '6' => 6,
        ];

        return $packages[$packageName] ?? 1; // Default to 'Cardio' if not found
    }
}
