<?php

namespace App\Http\Controllers;

use App\Models\AccessControl;
use App\Models\Member;
use App\Models\MembershipPackage;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SettingsController extends Controller
{
   public function index()
   {
      $accessControls = AccessControl::all();
      $packages = MembershipPackage::all();
      return Inertia::render('Settings/Index', compact('accessControls', 'packages'));
   }


   public function storeAccessControl(Request $request)
   {
      // Validate the incoming request data
      $validator = Validator::make($request->all(), [
         'name' => 'required|string|max:255',
         'type' => 'required|string|max:255',
         'ip_address' => 'required|ipv4',
         'username' => 'required|string|max:255',
         'password' => 'required|string|max:255',
         'port' => 'required|numeric|min:1|max:65535',
         'description' => 'nullable|string',
         'uuid' => 'nullable|string',
      ]);



      // If validation fails, return the errors
      if ($validator->fails()) {
         return back()->withErrors($validator)->withInput();
      }

      // Create a new access control entry
      AccessControl::create([
         'name' => $request->input('name'),
         'type' => $request->input('type'),
         'ip_address' => $request->input('ip_address'),
         'username' => $request->input('username'),
         'password' => $request->input('password'),
         'port' => $request->input('port'),
         'description' => $request->input('description'),
         'uuid' => $request->input('uuid'),
      ]);

      // Return success response to Inertia.js
      return redirect()->back()->with('success', 'Access Control added successfully');
   }



   public function updateAccessControl(Request $request, AccessControl $control)
   {
      // Validate the incoming request data
      $validator = Validator::make($request->all(), [
         'name' => 'required|string|max:255',
         'type' => 'required|string|max:255',
         'ip_address' => 'required|ipv4',
         'username' => 'required|string|max:255',
         'password' => 'nullable|string|max:255',
         'port' => 'required|numeric|min:1|max:65535',
         'description' => 'nullable|string',
         'uuid' => 'nullable|string',
      ]);

      // If validation fails, return the errors
      if ($validator->fails()) {
         return back()->withErrors($validator)->withInput();
      }

      $old_password = $control->password;

      $control->update([
         'name' => $request->input('name'),
         'type' => $request->input('type'),
         'ip_address' => $request->input('ip_address'),
         'username' => $request->input('username'),
         'password' => $request->input('password') ? $request->input('password') : $old_password,
         'port' => $request->input('port'),
         'description' => $request->input('description') ? $request->input('description') : null,
         'uuid' => $request->input('type') == 'isup' ? $request->input('uuid') : null,
      ]);

      // Return success response to Inertia.js
      return redirect()->back()->with('success', 'Access Control updated successfully');
   }



   public function storePackage(Request $request)
   {
      // Validate the incoming request data
      $validated = $request->validate([
         'package_name' => 'required|string|max:255|unique:membership_packages,package_name',
         'admission_amount' => 'required|numeric',
         'months' => 'nullable',
         'monthly_amount' => 'nullable|numeric',
         'discount_quarterly' => 'nullable|numeric',
         'discount_half_yearly' => 'nullable|numeric',
         'discount_yearly' => 'nullable|numeric',
         'access_control_ids' => 'array',
         'access_control_ids.*' => 'integer',
      ]);

      if ($validated['months'] == null || 0) {
         unset($validated['months']);
      }

      // Create a new membership package
      DB::table('membership_packages')->insert([
         'package_name' => $validated['package_name'],
         'admission_amount' => $validated['admission_amount'],
         'months' => $validated['months'],
         'monthly_amount' => $validated['monthly_amount'] ? $validated['monthly_amount'] : 0,
         'discount_quarterly' => $validated['discount_quarterly'] ? $validated['discount_quarterly'] : 0,
         'discount_half_yearly' => $validated['discount_half_yearly'] ? $validated['discount_half_yearly'] : 0,
         'discount_yearly' => $validated['discount_yearly'] ? $validated['discount_yearly'] : 0,
         'access_control_ids' => json_encode($validated['access_control_ids']),
      ]);

      // Return success response
      return redirect()->back()->with('success', 'Package added successfully');
   }


   public function updatePackage(Request $request, MembershipPackage $package)
   {
      // Validate the incoming request data
      $validated = $request->validate([
         'package_name' => [
            'required',
            'string',
            'max:255',
            Rule::unique('membership_packages', 'package_name')->ignore($package->id),
         ],
         'admission_amount' => 'nullable|numeric',
         'months' => 'required|numeric',
         'monthly_amount' => 'nullable|numeric',
         'discount_quarterly' => 'nullable|numeric',
         'discount_half_yearly' => 'nullable|numeric',
         'discount_yearly' => 'nullable|numeric',
         'access_control_ids' => 'array',
         'access_control_ids.*' => 'integer',
      ]);

      // Update the membership package
      DB::table('membership_packages')->where('id', '=', $package->id)->update([
         'package_name' => $validated['package_name'],
         'admission_amount' => $validated['admission_amount'],
         'months' => $validated['months'],
         'monthly_amount' => $validated['monthly_amount'] ? $validated['monthly_amount'] : 0,
         'discount_quarterly' => $validated['discount_quarterly'] ? $validated['discount_quarterly'] : 0,
         'discount_half_yearly' => $validated['discount_half_yearly'] ? $validated['discount_half_yearly'] : 0,
         'discount_yearly' => $validated['discount_yearly'] ? $validated['discount_yearly'] : 0,
         'access_control_ids' => json_encode($validated['access_control_ids']),
      ]);

      // Return success response
      return redirect()->back()->with('success', 'Package updated successfully');
   }

   public function test() {}
}
