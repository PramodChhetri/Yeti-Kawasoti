<?php

namespace App\Http\Controllers;

use App\Events\MemberDeleted;
use App\Events\MemberRegistered;
use App\Models\Official;
use App\Services\AccessControlService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class OfficialController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        $officials = Official::with('transactions')->get();

        // Pass data to the view via Inertia
        return Inertia::render('Officials/index', [
            'officials' => $officials,
        ]);
    }


    public function get_all()
    {
        $officials = Official::with('transactions')->get();
        return response()->json($officials);
    }

    // Only active officials
    public function get_active_staffs()
    {
        $officials = Official::where('status', 'active')->get();
        return response()->json($officials);
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
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string',
            'phone' => 'required|string|unique:officials',
            'gender' => 'required|in:male,female,other',
            'is_active' => 'required',
            'photo' => 'required|image|max:2048',
            'joining_date' => 'required|date',
            'position' => "required"
        ]);

        $official = new Official([
            'name' => $validatedData['name'],
            'phone' => $validatedData['phone'],
            'gender' => $validatedData['gender'],
            'is_active' => $validatedData['is_active'],
            'photo' => $validatedData['photo'],
            'joining_date' => Carbon::parse($validatedData['joining_date'])->format('Y-m-d'),
            'position' => $validatedData['position'],
        ]);

        $photoPath = "";

        if ($request->hasFile('photo')) {
            $photo = $request->file('photo');
            $photoPath = $photo->store('officials', 'public');
            $official->photo = 'storage/' . $photoPath;
        }

        $official->save();

        if ($official->id < 100000) {
            $official->id = 100000;
        }

        $official->joining_date = Carbon::parse($validatedData['joining_date'])->format('Y-m-d');

        $official->save();

        (new AccessControlService())->putStaff($official->id);

        return redirect()->route('officials.index')->with('success', 'Official created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Official $official)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Official $official)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Official $official)
    {
        // Validate the incoming request data
        $validatedData = $request->validate([
            'name' => 'required|string',
            'phone' => 'required|string|unique:officials,phone,' . $official->id,
            'gender' => 'required|in:male,female,other',
            'is_active' => 'required|boolean',
            'photo' => 'nullable|image|max:2048',
            'joining_date' => 'required|date',
            'position' => "required"
        ]);

        // Update the official's attributes
        $official->name = $validatedData['name'];
        $official->phone = $validatedData['phone'];
        $official->gender = $validatedData['gender'];
        $official->is_active = $validatedData['is_active'];
        $official->joining_date = Carbon::parse($validatedData['joining_date'])->format('Y-m-d');
        $official->position = $validatedData['position'];

        // Check if a new photo is uploaded
        if ($request->hasFile('photo')) {
            // Delete the old photo if it exists
            if ($official->photo) {
                Storage::delete("public/" . $official->photo);
            }

            // Store the new photo
            $photo = $request->file('photo');
            $photoPath = $photo->store('officials', 'public');
            $official->photo = 'storage/' . $photoPath;
        }

        // Save the updated official instance
        $official->save();

        if ($official->id < 90000)
            $official->update([
                'id' => 80000
            ]);

        return redirect()->route('officials.index')->with('success', 'Official updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Official $official)
    {
        //delete image and delete from database
        $id = $official->id;
        // event(new MemberDeleted($id));
        if ($official->photo) {
            Storage::delete("/public/" . $official->photo);
            $official->delete();
            return response()->json(['message' => 'Official deleted successfully.']);
        } else {
            $official->delete();
            return response()->json(['message' => 'Official deleted successfully.']);
        }
    }


    /*
    *   Disable Staff
    */
    public function disableStaff(Official $official)
    {
        $official->update([
            'status' => 'disabled'
        ]);

        (new AccessControlService())->deleteUser('STF' . $official->id);

        return response()->json(['message' => 'Official disabled successfully.']);
    }


    /*
    *   Enable Staff
    */
    public function enableStaff(string $officialId)
    {
        $official = Official::find($officialId);

        $official->update([
            'status' => 'active'
        ]);

        (new AccessControlService())->putStaff($officialId);

        return response()->json(['message' => 'Official enabled successfully.']);
    }
}
