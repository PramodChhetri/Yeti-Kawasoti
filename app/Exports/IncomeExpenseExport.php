<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class IncomeExpenseExport implements FromArray, WithHeadings, WithStyles
{
    protected $data, $gymName, $startDate, $endDate;

    /**
     * Constructor to initialize the export data.
     *
     * @param array $data
     * @param string $gymName
     * @param string $startDate
     * @param string $endDate
     */
    public function __construct(array $data, string $gymName, string $startDate, string $endDate)
    {
        $this->data = $data;
        $this->gymName = $gymName;
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    /**
     * Prepare the data for the export in a structured layout.
     *
     * @return array
     */
    public function array(): array
    {
        $rows = [];

        // Title Section
        $rows[] = [$this->gymName];
        $rows[] = ['Profit and Loss Statement from ' . $this->startDate . ' to ' . $this->endDate];
        $rows[] = []; // Blank row for spacing

        // Income Section
        $rows[] = ['Particulars', 'Amount'];
        $rows[] = ['Incomes', ''];


        $rows[] = [
            'Entry Payment',
            $this->data['netEntryPayments'],
        ];
        $rows[] = [
            'Renewal Payment',
            $this->data['netRenewalPayments'],
        ];
        $rows[] = [
            'Locker Payment',
            $this->data['netLockerPayments'],
        ];
        $rows[] = [
            'Miscellaneous Transaction',
            $this->data['netMiscellaneousTransaction'],
        ];
        $rows[] = ['Total Income', $this->data['totalIncome']];

        $rows[] = []; // Blank row for spacing

        // Expenses Section
        $rows[] = ['Expenses', ''];
        $rows[] = ['Salary', $this->data['netOfficialSalaryTransactions']];
        $rows[] = ['Wage', $this->data['netWageExpenses']];
        $rows[] = ['Rent', $this->data['netRentExpenses']];
        $rows[] = ['Marketing', $this->data['netMarketingExpenses']];
        $rows[] = ['Maintenance', $this->data['netMaintenanceExpenses']];
        $rows[] = ['Stationary', $this->data['netStationaryExpenses']];
        $rows[] = ['Equipment', $this->data['netEquipmentExpenses']];
        $rows[] = ['Utility', $this->data['netUtilityExpenses']];
        $rows[] = ['Other Expenses', $this->data['netOtherExpenses']];
        // Refunds Section
        $rows[] = [
            'Refund ',
            $this->data['netRefunds'],
        ];
        $rows[] = ['Total Expenses', $this->data['totalExpense']];


        $rows[] = []; // Blank row for spacing

        $rows[] = ['Net Profit/Loss', $this->data['netIncome']];

        return $rows;
    }

    /**
     * Define the headings for the exported file.
     *
     * @return array
     */
    public function headings(): array
    {
        return [];
    }

    /**
     * Apply styles to specific rows or cells in the worksheet.
     *
     * @param Worksheet $sheet
     * @return array
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Gym Name (Row 1)
            1 => [
                'font' => [
                    'bold' => true,
                    'size' => 18,
                ],
                'alignment' => [
                    'horizontal' => 'center',
                ],
            ],

            // Profit and Loss Statement Title (Row 2)
            2 => [
                'font' => [
                    'bold' => true,
                    'size' => 14,
                ],
                'alignment' => [
                    'horizontal' => 'center',
                ],
            ],

            // Section Headers (e.g., Income, Expenses, etc.)
            3 => [
                'font' => [
                    'bold' => true,
                    'size' => 12,
                ],
                'fill' => [
                    'fillType' => 'solid',
                    'startColor' => ['rgb' => 'D9EAD3'], // Light green background
                ],
            ],

            // Column Headings
            4 => [
                'font' => [
                    'bold' => true,
                ],
                'fill' => [
                    'fillType' => 'solid',
                    'startColor' => ['rgb' => 'F4CCCC'], // Light red background
                ],
                'alignment' => [
                    'horizontal' => 'center',
                ],
            ],

            9 => [
                'font' => [
                    'bold' => true,
                ],
            ],


            10 => [
                'font' => [
                    'bold' => true,
                ],
                'alignment' => [
                    'horizontal' => 'center',
                ],
                'fill' => [
                    'fillType' => 'solid',
                    'startColor' => ['rgb' => 'F4CCCC'], // Light red background
                ],
            ],

            21 => [
                'font' => [
                    'bold' => true,
                ],
            ],

            22 => [
                'font' => [
                    'bold' => true,
                ],
                'fill' => [
                    'fillType' => 'solid',
                    'startColor' => ['rgb' => 'ADD8E6'], // Light blue background
                ],
            ],
        ];
    }


    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // Merge the cells for the Gym Name (Row 1, Columns A and B)
                $sheet->mergeCells('A1:B1');
                $sheet->getStyle('A1:B1')->applyFromArray([
                    'alignment' => [
                        'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                    ],
                    'font' => [
                        'bold' => true,
                        'size' => 18,
                    ],
                ]);

                // Merge the cells for the Profit and Loss Statement title (Row 2, Columns A and B)
                $sheet->mergeCells('A2:B2');
                $sheet->getStyle('A2:B2')->applyFromArray([
                    'alignment' => [
                        'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                    ],
                    'font' => [
                        'bold' => true,
                        'size' => 14,
                    ],
                ]);
            },
        ];
    }
}
