import { Link, Head, usePage } from '@inertiajs/react';
import { ThemeProvider } from '@/Components/ThemeProvider';
import { Toaster } from '@/Components/ui/toaster';
import MembershipCreationDialog from '@/Components/Blocks/CreateDialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { useState } from 'react';
import axios from 'axios';
import { toast } from '@/Components/ui/use-toast'; // For displaying messages
import PublicRenewPackageDialog from '@/Components/Blocks/RenewPackageDialog';
import { Dialog, DialogContent, DialogTrigger } from '@/Components/ui/dialog';

export default function Welcome() {
    const { url } = usePage(); // Get current page information
    const path = url; // Extract path from URL
    
    const { props } = usePage() as { props: { env: { gymName: string } } };

    const [phone, setPhone] = useState<string>('');  // Store the phone number entered by the user
    const [member, setMember] = useState<any>(null);  // Will store member data if found

    const searchURL = new URLSearchParams(window.location.search); // Get URL parameters
    const [dialogOpen, setDialogOpen] = useState(false); // Controls the renewal dialog state
    const [renewOpen, setRenewOpen] = useState(searchURL.get('form') === 'renew'); // Check if the renewal dialog should be open initially

    // Handle phone number based membership renewal request
    const handleRenewPhoneRequest = async () => {
        try {
            const response = await axios.get(`/get-renewal-form/${phone}`);
            if (response.data.member) {
                setMember(response.data.member); // Store member data
                setRenewOpen(false);
                setDialogOpen(true); // Open dialog on successful response
            } else {
                toast({ description: 'Member not found or no active membership' });
            }
        } catch (error) {
            toast({ description: 'Error fetching member data' });
        }
    };

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            <div className='w-full h-screen bg-no-repeat bg-cover relative' style={{ backgroundImage: "url('gym-bg.jpg')" }}>
                <Head title={`Welcome to ${props.env.gymName}`} />
                <div className="absolute w-full min-h-full bg-black/60 text-white" />
                <div className='relative container min-h-full flex flex-col'>
                    {/* Header section with logo and admin area link */}
                    <div className='py-7 flex justify-between items-center'>
                        <Link href="/" className="flex items-center py-3 px-5 w-fit">
                            <span className='text-xl sm:text-2xl text-white font-semibold'>{props.env.gymName}</span>
                        </Link>
                        <div className='flex items-center gap-2'>
                            <Link href="/login" className="text-sm text-gray-200 hover:underline">Go to Admin Area</Link>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className='grow flex items-center justify-center'>
                        <div className='space-y-4'>
                            {/* Engaging Title and Subtitle */}
                            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-center text-white font-extrabold uppercase">
                                Welcome to {props.env.gymName}
                            </h1>
                            <h3 className='text-white/75 text-center capitalize md:text-lg lg:text-xl font-semibold'>
                                Your Fitness Journey Starts Here. Let's Achieve Your Goals Together.
                            </h3>

                            {/* Actions - Membership Creation and Renewal Dialog */}
                            <div className='flex gap-2 mx-auto justify-center'>
                                <MembershipCreationDialog /> {/* Membership Creation Button */}
                                
                                <Dialog open={renewOpen} onOpenChange={setRenewOpen}>
                                    <DialogTrigger>
                                        <Button className='md:hidden' size={'sm'}>Renew Membership</Button>
                                        <Button className='hidden md:block'>Renew Membership</Button>
                                    </DialogTrigger>
                                    <DialogContent className='space-y-1'>
                                        <h2 className='font-bold'>Enter Phone Number to Renew</h2>
                                        <Input 
                                            type='number' 
                                            className='flex-grow' 
                                            onChange={e => setPhone(e.target.value)} 
                                            placeholder="Phone number"
                                        />
                                        <div className="text-end">
                                            <Button className='me-auto' onClick={handleRenewPhoneRequest}>
                                                Submit Renewal Request
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Toast notifications */}
            <Toaster />

            {/* Public Renewal Package Dialog (only shows if member data is found) */}
            {member && (
                <PublicRenewPackageDialog
                    member={member}  // Pass the member data to the renewal dialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}  // Close dialog
                />
            )}
        </ThemeProvider>
    );
}
