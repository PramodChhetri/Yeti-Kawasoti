<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRegistrationApplicationRequest;
use App\Models\RegistrationApplication;
use Illuminate\Http\Request;

class RegistrationApplicationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRegistrationApplicationRequest $request)
    {
        $validatedData = $request->validated();

        // Check if a photo is uploaded
        if ($request->hasFile('photo')) {
            // Store the file in the 'members' directory under 'public' disk
            $fileName = $request->file('photo')->getClientOriginalName();
            $filePath = $request->file('photo')->storeAs('members', $fileName, 'public');

            // Update validated data to include the correct file path
            $validatedData['photo'] = 'storage/' . $filePath;
        }

        // Check if a payment_proof is uploaded
        if ($request->hasFile('payment_proof')) {
            // Store the file in the 'members' directory under 'public' disk
            $fileName = $request->file('payment_proof')->getClientOriginalName();
            $filePath = $request->file('payment_proof')->storeAs('payment_proof', $fileName, 'public');

            // Update validated data to include the correct file path
            $validatedData['payment_proof'] = 'storage/' . $filePath;
        }

        // Store the registration application
        RegistrationApplication::create($validatedData);

        return redirect()->back()->with('success', 'Registration submitted successfully, pending admin approval.');
    }


    /**
     * Display the specified resource.
     */
    public function show(RegistrationApplication $registrationApplication)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(RegistrationApplication $registrationApplication)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RegistrationApplication $registrationApplication)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RegistrationApplication $registrationApplication)
    {
        //
    }
}
