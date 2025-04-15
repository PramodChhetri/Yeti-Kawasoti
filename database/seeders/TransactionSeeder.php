<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        // Path to the CSV file
        $filePath = public_path('payments.csv');

        // Temporarily disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Truncate the 'members' table
        DB::table('transactions')->truncate();

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

                $transactionData = [
                    'id' => $rowData['id'],
                    'member_id' => $rowData['member_id'],
                    'name' => null,
                    'transaction_type' => $rowData['with_admission'] == 1 ? 'Entry Payment' : 'Renewal',
                    'description' => null,
                    'total_amount' => $rowData['amount'],
                    'paid_amount' => $rowData['amount'],
                    'payment_date' => $rowData['payment_date'],
                    'payment_mode' => $rowData['payment_mode'],
                    'bill_number' => $rowData['bill_number'],
                    'remarks' => null,
                ];
                Log::info($transactionData['id']);


                $map[] = (int) $transactionData['id'];

                // Insert or update the member in the database
                DB::table('transactions')->insert($transactionData);
            }

            Log::info($map);

            // Close the file after reading
            fclose($handle);
        }
    }
}
