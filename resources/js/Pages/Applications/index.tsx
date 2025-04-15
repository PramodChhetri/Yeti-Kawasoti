import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { useEffect, useState } from 'react';
import { CircleCheck, CircleX } from 'lucide-react';
import { Loader } from '@/Components/loader';
import { format } from 'date-fns';
import RenewalApprovalBlock from './RenewalApprovalBlock';
import RegistrationApprovalBlock from './RegistrationApprovalBlock';
import RejectionBlock from './RejectionBlock';

export default function ApplicationsPage({ auth, applications, activeTab }: PageProps<{ applications: any; activeTab: string }>) {
    const [currentTab, setCurrentTab] = useState(activeTab || 'registration_applications');
    const [loading, setLoading] = useState(true);

    // Function to switch between tabs
    const switchTab = (tab: string) => {
        setLoading(true); // Set loading to true when switching tabs
        setCurrentTab(tab);
        router.get(route('applications.index'), { tab }, {
            onFinish: () => setLoading(false), // Set loading to false when data is fetched
        });
    };

    useEffect(() => {
        setLoading(false); // Simulate loading done when the component mounts
    }, []);


    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Applications</h2>}>
            <Head title="Applications" />
            <Card>
                <CardHeader className="flex justify-between flex-row">
                    <div>
                        <CardTitle>Applications</CardTitle>
                        <CardDescription>View and manage gym applications</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={currentTab} onValueChange={switchTab}>
                        <TabsList>
                            <TabsTrigger value="registration_applications" children="Registration Applications" />
                            <TabsTrigger value="renewal_applications" children="Renewal Applications" />
                        </TabsList>
                        {
                            loading ? <div className="flex justify-center items-center my-10">
                                <Loader size="lg" />
                            </div> :
                                <>
                                    {
                                        currentTab === 'registration_applications'
                                        && renderRegistrationApplicationsTable(applications)
                                    }
                                    {
                                        currentTab === 'renewal_applications'
                                        && renderRenewalApplicationsTable(applications)
                                    }

                                </>
                        }

                    </Tabs>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}

// Render Table for Registration Applications
function renderRegistrationApplicationsTable(data: any) {
    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Image</TableHead> {/* to render photo */}
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Occupation</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Date of Birth</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Package</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.data.length > 0 ? data.data.map((application: any) => (
                        <TableRow key={application.id}>

                            <TableCell>
                                <img src={application.photo} className='w-14 h-14 object-cover rounded-full border-2 border-primary p-0.5' />
                            </TableCell>
                            {/* Render Name */}
                            <TableCell>{application.name}</TableCell>

                            {/* Render Phone */}
                            <TableCell>{application.phone}</TableCell>

                            {/* Render Occupation */}
                            <TableCell>{application.occupation}</TableCell>

                            {/* Render Gender */}
                            <TableCell>{application.gender.charAt(0).toUpperCase() + application.gender.slice(1)}</TableCell>

                            {/* Render Date of Birth */}
                            <TableCell>{new Date(application.date_of_birth).toLocaleDateString()}</TableCell>

                            {/* Render Address */}
                            <TableCell>{application.address}</TableCell>

                            {/* Render Package */}
                            <TableCell>{application.membership_package.package_name}</TableCell>

                            {/* Render Duration */}
                            <TableCell>{application.months} Months</TableCell>


                            {/* Render Action */}
                            <TableCell>
                                <RegistrationApprovalBlock application={application} />
                                <RejectionBlock rejectionType={'admission'} applicationId={application.id} />
                            </TableCell>
                        </TableRow>
                    ))
                        :
                        <TableRow>
                            <TableCell className='text-center' colSpan={100}>No applications found.</TableCell>
                        </TableRow>
                    }
                </TableBody>

            </Table>
        </div>
    );
}

// Render Table for Renewal Applications
function renderRenewalApplicationsTable(data: any) {
    return (
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead />
                        <TableHead>Member Name</TableHead>
                        <TableHead>Membership Package</TableHead>
                        <TableHead>Is Expiring On</TableHead>
                        <TableHead>Months</TableHead>
                        <TableHead>Submitted On</TableHead>
                        <TableHead>Payment Proof</TableHead>
                        <TableHead />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.data.length > 0 ? data.data.map((renewal: any) => (
                        <TableRow key={renewal.id}>
                            <TableCell>
                                <img src={renewal.member.photo} className='size-16 min-w-16 object-cover rounded-full border-2 border-primary p-0.5' />
                            </TableCell>
                            <TableCell>{renewal.member.name}</TableCell>
                            <TableCell>{renewal.member.membership_package.package_name}</TableCell>
                            <TableCell>
                                {
                                    format(new Date(renewal.member.payment_expiry_date), "MMMM d")
                                }
                            </TableCell>
                            <TableCell>{renewal.months} Months</TableCell>
                            <TableCell>
                                {format(new Date(renewal.created_at), "MMMM d 'at' h:mm aaa")}
                            </TableCell>
                            <TableCell>
                                {
                                    renewal.payment_proof_path ?
                                        <a href={renewal.payment_proof_path} target="_blank" rel="noopener noreferrer">View Payment Proof</a>
                                        :
                                        <span className="text-muted-foreground">Not Available</span>
                                }
                            </TableCell>
                            <TableCell>
                                <RenewalApprovalBlock application={renewal} />
                                <RejectionBlock rejectionType={'renewal'} applicationId={renewal.id} />
                            </TableCell>
                        </TableRow>
                    ))
                        :
                        <TableRow>
                            <TableCell className='text-center' colSpan={100}>No Renewal Applications found.</TableCell>
                        </TableRow>
                    }
                </TableBody>
            </Table>
        </CardContent>
    );
}