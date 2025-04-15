<?php

namespace App\Http\Controllers;

use App\Models\ExtraCredit;
use App\Models\Member;
use Illuminate\Http\Request;

class ExtraCreditController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'member_id' => 'required|exists:members,id',
            'remarks' => 'required|string|max:255',
            'amount' => 'required|numeric',
            'bill_number' => 'required|string',
        ]);

        ExtraCredit::create($request->all());

        $member = Member::find($request->member_id);
        $member->credit += $request->amount;
        $member->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Extra credit added successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ExtraCredit $extraCredit)
    {
        $member = Member::find($extraCredit->member_id);

        // Check if the member's credit is sufficient
        if ($member->credit < $extraCredit->amount) {
            return response()->json([
                'status' => 'error',
                'message' => 'Insufficient credit to delete this extra credit.'
            ], 400);
        }

        // Deduct the extra credit amount from the member's credit
        $member->credit -= $extraCredit->amount;
        $member->save();

        // Delete the extra credit record
        $extraCredit->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Extra credit deleted successfully'
        ]);
    }
}
