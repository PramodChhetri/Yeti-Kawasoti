<?php

namespace App\Http\Controllers;

use App\Models\AccessControl;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;

class EventsController extends Controller
{
    public function index(Request $request)
    {
        $devices = AccessControl::all();

        $defaultDevice = AccessControl::first();

        // Extract page number from request or default to page 1
        $page = $request->get('page', 1);
        $perPage = 30;
        $searchResultPosition = ($page - 1) * $perPage;

        $name = $request->get('name', '');
        $employeeNoString = $request->get('employeeNoString', '');

        $startTime = $request->get('startTime', now()->subDecade()->unix() * 1000);
        $endTime = $request->get('endTime', (string) now()->unix() * 1000);

        $startTime = Carbon::createFromTimestampMs($startTime, 'Asia/Kathmandu')->format('Y-m-d\TH:i:sP');
        $endTime = Carbon::createFromTimestampMs($endTime, 'Asia/Kathmandu')->format('Y-m-d\TH:i:sP');


        $acsEventCond = [
            "AcsEventCond" => [
                "searchID" => "150",
                "searchResultPosition" => $searchResultPosition,
                "maxResults" => 31,
                "major" => 5,
                "minor" => 75,
                "startTime" =>  $startTime,
                "endTime" => $endTime
            ]
        ];

        if (!empty((string) $employeeNoString)) {
            $acsEventCond['AcsEventCond']['employeeNoString'] = (string) $employeeNoString;
        }

        if (!empty($name)) {
            $acsEventCond['AcsEventCond']['name'] = $name;
        }

        $deviceId = $request->get('device_id', $defaultDevice->id);

        // Selected Device
        $selectedDevice = AccessControl::find($deviceId);

        if ($selectedDevice->type == 'isup') {
            // Perform the API request to fetch events
            $response = Http::withDigestAuth(
                'admin',
                $selectedDevice->password
            )->post($selectedDevice->ip_address . ':' . $selectedDevice->port . '/ISAPI/AccessControl/AcsEvent?format=json&devIndex=' . $selectedDevice->uuid, $acsEventCond);
        } else {
            // Perform the API request to fetch events
            $response = Http::withDigestAuth(
                'admin',
                $selectedDevice->password
            )->post($selectedDevice->ip_address . ':' . $selectedDevice->port . '/ISAPI/AccessControl/AcsEvent?format=json', $acsEventCond);
        }


        // Check if the API request was successful
        if ($response->successful()) {
            // Decode the response JSON data
            $eventsData = $response->json();

            // Calculate pagination details
            $totalMatches = $eventsData['AcsEvent']['totalMatches'] ?? 0;

            $events = new LengthAwarePaginator($eventsData['AcsEvent']['InfoList'] ?? [], $totalMatches, 30, $page);


            // Use URL::current() and add query parameters
            $events->setPath(URL::current() . '?' . http_build_query(array_merge($request->query(), ['page' => null])));

            return Inertia::render('Events/index', compact('events', 'devices', 'selectedDevice'));
        } else {
            return Inertia::render('Events/index', [
                'events' => new LengthAwarePaginator([], 0, 30, $page),
                'devices' => $devices,
                'selectedDevice' => $selectedDevice,
                'error' => 'Failed to fetch events data.'
            ]);
        }
    }
}
