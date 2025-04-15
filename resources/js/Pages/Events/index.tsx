import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow, TableFooter } from '@/Components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import React, { useEffect, useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react'; // Link for pagination
import moment from 'moment';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { FilterIcon } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/Components/ui/pagination"
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/Components/ui/dropdown-menu"

// Define the structure for each event
interface Event {
    major: number;
    minor: number;
    time: string;
    cardType: number;
    name: string;
    cardReaderNo: number;
    doorNo: number;
    employeeNoString: string;
    type: number;
    serialNo: number;
    userType: string;
    currentVerifyMode: string;
    mask: string;
}

// Define the structure for the response containing events and metadata
interface EventsResponse {
    current_page: number;
    data: Event[];
    links: { active: boolean; url: string | null; label: string }[];
    first_page_url: string;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    total: number;
}

interface Device{
    id: number,
    name: string,
    ip_address: string,
    username: string,
    password: string,
    port: number,
}

// Define the props structure that includes the events response
interface Props extends PageProps {
    events: EventsResponse;
    devices: Device[];
    selectedDevice: Device;
}

// The Events component
export default function Events({ auth, events, devices, selectedDevice }: Props) {
    const [selectedDeviceId, setSelectedDeviceId] = useState<number>(selectedDevice.id);
    const [selectedDeviceName, setSelectedDeviceName] = useState<string>(selectedDevice.name);

    const handleChangeInDevice = (deviceId: number) => {
        // Whenever the selectedDeviceId changes, fetch data for the new device
        setSelectedDeviceId(deviceId);  // Update the selected device ID in state
    
        const params = new URLSearchParams(window.location.search);
        params.set('device_id', deviceId.toString());  // Add the device_id to the query params
        params.set('page', '1');  // Reset to the first page when device changes
    
        // Trigger the request to fetch data for the selected device
        router.get(`${window.location.pathname}?${params.toString()}`);
    };
    


    const [mode, setMode] = useState<'attendance' | 'checkins'>(localStorage.getItem('mode') as any || 'checkins');
    const { data: InfoList, current_page, total, per_page } = events;
    const { url } = usePage();
    const pageParams = new URLSearchParams(url.split('?')[1]);
    const { data, setData } = useForm({
        name: pageParams.get('name') || '',
        employeeNoString: pageParams.get('employeeNoString') || '',
        startTime: pageParams.get('startTime') && moment(Number(pageParams.get('startTime'))).format("YYYY-MM-DD") || '',
        endTime: pageParams.get('endTime') && moment(pageParams.get('endTime')).format('YYYY-MM-DD') || '',
    });


    const handleModeChange = (newMode: 'attendance' | 'checkins') => {
        setMode(newMode);
        localStorage.setItem('mode', newMode);
    };


    const getAttendanceData = (events: Event[]) => {
        const attendanceMap: Record<string, { checkIn: string; checkOut: string; name: string; employeeNoString: string; date: string }> = {};

        events.forEach(event => {
            const date = moment(event.time).format('YYYY/MM/DD');
            const key = `${event.employeeNoString}-${date}`;

            if (!attendanceMap[key]) {
                // Initialize with the first event as check-in and check-out
                attendanceMap[key] = {
                    checkIn: event.time,
                    checkOut: event.time,
                    name: event.name,
                    employeeNoString: event.employeeNoString,
                    date,
                };
            } else {
                // Update check-in and check-out times
                if (moment(event.time).isBefore(attendanceMap[key].checkIn)) {
                    attendanceMap[key].checkIn = event.time;
                }
                if (moment(event.time).isAfter(attendanceMap[key].checkOut)) {
                    attendanceMap[key].checkOut = event.time;
                }
            }
        });

        console.log(attendanceMap);

        return Object.values(attendanceMap);
    };


    const attendanceData = mode === 'attendance' ? getAttendanceData(InfoList) : [];


    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Convert start and end times to Unix timestamp in milliseconds
        const startTimeMillis = data.startTime ? new Date(data.startTime + "T00:00:00+05:45").getTime() : '';
        const endTimeMillis = data.endTime ? new Date(data.endTime + "T23:59:59+05:45").getTime() : '';

        const params = new URLSearchParams();
        if (data.name) params.set('name', data.name);
        if (data.employeeNoString) params.set('employeeNoString', data.employeeNoString);
        if (startTimeMillis) params.set('startTime', startTimeMillis.toString());
        if (endTimeMillis) params.set('endTime', endTimeMillis.toString());

        //const currentPage = new URLSearchParams(window.location.search).get('page') || '1';
        params.set('page', '1');

        //alert(params);
        // Perform the GET request with updated query parameters
        router.get(`${window.location.pathname}?${params.toString()}`);
    };




    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Events</h2>}
        >
            <Card>
                <CardHeader className="flex flex-row justify-between items-center flex-wrap">
                    <div>
                        <CardTitle>Daily Check-Ins</CardTitle>
                        <CardDescription>Analyse events of gym members for {selectedDeviceName}</CardDescription>
                    </div>
                    <div className="flex justify-end mt-2 gap-2">
                        <div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">Select Device</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>Devices</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={selectedDeviceId.toString()} onValueChange={(value) => handleChangeInDevice(Number(value))}>
                                {devices.map(device => (
                                    <DropdownMenuRadioItem key={device.ip_address} value={device.id.toString()}>
                                        {device.name}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>


                        </div>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="secondary" className="flex items-center">
                                    <FilterIcon className="size-4 me-2" /> Filter
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                                <div className="grid gap-4">
                                    <h3 className='font-bold'>Filter Check-in events</h3>
                                    <form className='space-y-2' onSubmit={handleFilterSubmit}>
                                        {/* Full Name */}
                                        <div>
                                            <Label>Full Name</Label>
                                            <Input
                                                placeholder="Enter Full Name of Member"
                                                type="text"
                                                value={data.name}
                                                onChange={e => setData('name', e.target.value)}
                                            />
                                        </div>
                                        {/* Member ID */}
                                        <div>
                                            <Label>Member ID</Label>
                                            <Input
                                                placeholder="Enter Member ID"
                                                type="text"
                                                value={data.employeeNoString}
                                                onChange={e => setData('employeeNoString', e.target.value)}
                                            />
                                        </div>
                                        {/* Start Date */}
                                        <div>
                                            <Label>Start Date</Label>
                                            <Input
                                                type="date"
                                                value={data.startTime}
                                                onChange={e => setData('startTime', e.target.value)}
                                            />
                                        </div>
                                        {/* End Date */}
                                        <div>
                                            <Label>End Date</Label>
                                            <Input
                                                type="date"
                                                value={data.endTime}
                                                onChange={e => setData('endTime', e.target.value)}
                                            />
                                        </div>
                                        {/* Submit */}
                                        <Button type="submit" className="w-full">
                                            <FilterIcon className="size-4 me-2" />  Filter Search
                                        </Button>
                                    </form>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <div className='flex rounded-lg overflow-hidden'>
                            <Button variant={"outline"} onClick={() => handleModeChange('checkins')} className={`rounded-none rounded-s-lg ${mode === 'checkins' ? 'text-primary hover:text-primary font-bold bg-primary/5 border-primary' : ''}`}>Check-Ins</Button>
                            <Button variant={"outline"} onClick={() => handleModeChange('attendance')} className={`rounded-none rounded-e-lg ${mode === 'attendance' ? 'text-primary hover:text-primary font-bold bg-primary/5 border-primary' : ''}`}>Attendance</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {mode === 'checkins' ? (
                        <Table className="table-auto w-full text-left">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Member ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Check - In Time</TableHead>
                                    <TableHead>Week Day</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {InfoList && InfoList.length > 0 ? (
                                    InfoList.map((event, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{event.employeeNoString}</TableCell>
                                            <TableCell>{event.name}</TableCell>
                                            <TableCell>{moment(event.time).format('YYYY/MM/DD')}</TableCell>
                                            <TableCell>{moment(event.time).format('hh:mm A')}</TableCell>
                                            <TableCell>{moment(event.time).format('dddd')}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">
                                            No events found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    ) : (
                        <Table className="table-auto w-full text-left">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Member ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Check - In Time</TableHead>
                                    <TableHead>Check - Out Time</TableHead>
                                    <TableHead>Week Day</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attendanceData && attendanceData.length > 0 ? (
                                    attendanceData.map((attendance, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{attendance.employeeNoString}</TableCell>
                                            <TableCell>{attendance.name}</TableCell>
                                            <TableCell>{attendance.date}</TableCell>
                                            <TableCell>{moment(attendance.checkIn).format('hh:mm A')}</TableCell>
                                            <TableCell>{moment(attendance.checkOut).format('hh:mm A')}</TableCell>
                                            <TableCell>{moment(attendance.date, 'YYYY/MM/DD').format('dddd')}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">
                                            No attendance records found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                    <div className="flex justify-between w-full items-center">
                        {/* Pagination Controls - This will be customized later */}
                        <span>
                            Showing Results {events.data.length} of {total}
                        </span>
                        <Pagination className='w-fit mx-0'>
                            <PaginationContent>
                                <PaginationPrevious href={events.prev_page_url as string} />
                                {
                                    events.links.slice(1, -1).map((link, i) => (
                                        <PaginationItem key={i} >
                                            <PaginationLink href={link.url as string} isActive={link.active} dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </PaginationItem>
                                    ))
                                }
                                <PaginationNext href={events.next_page_url as string} />
                            </PaginationContent>
                        </Pagination>
                    </div>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
