<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOfficialTransactionRequest;
use App\Models\OfficialTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class OfficialTransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index(Request $request)
    {

        $data = QueryBuilder::for(OfficialTransaction::all())
            ->allowedFilters([
                AllowedFilter::callback('startDate', function ($query, $value) {
                    $query->whereDate('transaction_date', '>=', $value);
                }),
                AllowedFilter::callback('endDate', function ($query, $value) {
                    $query->whereDate('transaction_date', '<=', $value);
                })
            ])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('OfficialTransactions/Index', [
            'data' => $data,
        ]);
    }




    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOfficialTransactionRequest $request)
    {
        // Start a transaction
        return DB::transaction(function () use ($request) {
            $transaction = OfficialTransaction::create($request->validated());

            return redirect()->back()->with('success', 'Transaction created successfully.');
        });
    }
}
