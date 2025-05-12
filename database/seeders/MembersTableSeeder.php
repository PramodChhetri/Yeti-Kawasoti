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
        $filePath = public_path('yeti_members.csv');

        // Temporarily disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Truncate the 'members' table
        DB::table('members')->truncate();

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Open the file and read its contents
        if (($handle = fopen($filePath, 'r')) !== false) {
            $header = fgetcsv($handle, 1000, ',');

            // Ensure the correct header
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
                    'occupation' => $rowData['occupation'] ?? 'others', // Default to 'others' if occupation is not provided
                    'address' => $rowData['address'],
                    'membership_package_id' => $this->mapMembershipPackage($rowData['membership_package_id']),
                    'start_date' => $this->parseDate($rowData['start_date']),
                    'end_date' => $this->parseDate($rowData['end_date']),
                    'payment_expiry_date' => $this->parseDate($rowData['payment_expiry_date']),
                    'total_payment' => $rowData['total_payment'], // Default for now, can be updated
                    'credit' => 0, // Default value for credit
                    'is_approved' => 1, // Assuming all members are approved
                    'marital_status' => 'single', // Default to 'single' if not present in data
                    'preferred_time' => $rowData['preferred_time'] ?? 'any', // Default value
                    'on_device' => 0, // Default value
                    'date_of_birth' => $this->parseDate($rowData['date_of_birth']), // Default if not provided
                    'photo' => $rowData['photo'] ?? null, // Assuming photo is optional
                    'emergency_person_name' => $rowData['emergency_person_name'] ?? null, // Emergency person name
                    'emergency_person_phone' => $rowData['emergency_person_phone'] ?? null, // Emergency person phone
                    'remarks' => $rowData['remarks'] ?? null, // Remarks field
                    'balance' => 0, // Default balance
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ];

                $map[] = (int) $memberData['id'];

                // Insert or update the member in the database
                DB::table('members')->insert($memberData);
            }

            Log::info($map);

            // Close the file after reading
            fclose($handle);
        }
    }

    // Parse date or return null if 'NULL' or empty
    private function parseDate($date)
    {
        return ($date && $date !== 'NULL') ? Carbon::parse($date)->format('Y-m-d') : null;
    }

    // Map membership packages based on the table you've provided
    private function mapMembershipPackage($packageName)
    {
        $packages = [
            '1' => 1,
            '2' => 2,
            '3' => 3,
        ];

        return $packages[$packageName] ?? 1; // Default to '1' if not found
    }
}
