import { useState, useEffect, FormEvent } from "react";
import { router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { PageProps } from "@/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/Components/ui/tabs"; // Import Tabs components
import { Button } from "@/Components/ui/button";
import { Loader } from "@/Components/loader"; // Add a loader component (or create your own)
import TransactionDialog from "./TransactionDialog";
import { Badge } from "@/Components/ui/badge";
import { format } from "date-fns";
import { Download, FilterIcon, Mail, Send, SendHorizonal } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import axios from "axios";
import { Member } from "@/types/members";
import { toast } from "@/Components/ui/use-toast";

export default function Transactions({
    auth,
    data,
    activeTab,
    creditedMembers,
}: PageProps<{ data: any; activeTab: string; creditedMembers: Member[] }>) {
    const [currentTab, setCurrentTab] = useState(activeTab || "registrations");
    const [loading, setLoading] = useState(true); // Add loading state

    // Function to handle tab switching
    const switchTab = (tab: string) => {
        setLoading(true); // Set loading to true when switching tabs
        setCurrentTab(tab);
        router.get(
            route("transactions.index"),
            { tab },
            {
                onFinish: () => setLoading(false), // Set loading to false when data is fetched
            }
        );
    };

    // Simulate initial data fetch
    useEffect(() => {
        setLoading(false); // Simulate loading done when the component mounts
    }, []);

    // Function to handle pagination
    const handlePagination = (url: string) => {
        if (url) {
            setLoading(true);
            router.visit(url, {
                onFinish: () => setLoading(false),
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const TransactionFilter = () => {
        const queryParams = new URLSearchParams(window.location.search);
        const initialStartDate = queryParams.get("filter[startDate]") || "";
        const initialEndDate = queryParams.get("filter[endDate]") || "";

        const { data, setData, errors } = useForm({
            startDate: initialStartDate,
            endDate: initialEndDate,
        });

        const handleSubmit = (e: FormEvent) => {
            e.preventDefault();
            let updatedParams = new URLSearchParams(window.location.search);
            if (data.startDate) {
                updatedParams.set("filter[startDate]", data.startDate);
            } else {
                updatedParams.delete("filter[startDate]"); // Remove if empty
            }

            if (data.endDate) {
                updatedParams.set("filter[endDate]", data.endDate);
            } else {
                updatedParams.delete("filter[endDate]"); // Remove if empty
            }
            router.visit(
                route("transactions.index") + "?" + updatedParams.toString()
            );
        };

        useEffect(() => {
            // Check if values are assigned correctly in data
            if (!data.startDate) setData("startDate", initialStartDate);
            if (!data.endDate) setData("endDate", initialEndDate);
        }, [setData, initialStartDate, initialEndDate]);

        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="secondary" className="flex items-center">
                        <FilterIcon className="size-4 me-2" /> Filter
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-fit">
                    <form
                        className="flex gap-2 items-end"
                        onSubmit={handleSubmit}
                    >
                        <div>
                            <Label>Start Date</Label>
                            <Input
                                type="date"
                                value={data.startDate || ""}
                                onChange={(e) =>
                                    setData("startDate", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label>End Date</Label>
                            <Input
                                type="date"
                                value={data.endDate || ""}
                                onChange={(e) =>
                                    setData("endDate", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Button type="submit" className="w-full">
                                Filter
                            </Button>
                        </div>
                    </form>
                </PopoverContent>
            </Popover>
        );
    };

    const ExportTransaction = () => {
        const { data, setData, post, processing } = useForm({
            startDate: "",
            endDate: "",
        });

        const handleSubmit = async (e: any) => {
            e.preventDefault();
            try {
                const response = await axios.post(
                    "/export-transactions",
                    {
                        startDate: data.startDate,
                        endDate: data.endDate,
                    },
                    {
                        responseType: "blob", // Important for handling file download
                    }
                );

                const url = window.URL.createObjectURL(
                    new Blob([response.data])
                );
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute(
                    "download",
                    `income-expense-statement-${data.startDate}-to-${data.endDate}.xlsx`
                );
                document.body.appendChild(link);
                link.click();
                link.remove();
            } catch (error) {
                console.error("Error exporting data:", error);
            }
        };

        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="secondary" className="flex items-center">
                        <Download className="size-4 me-2" /> Export
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-fit">
                    <form
                        className="flex gap-2 items-end"
                        onSubmit={handleSubmit}
                    >
                        <div>
                            <Label>Start Date</Label>
                            <Input
                                type="date"
                                value={data.startDate || ""}
                                onChange={(e) =>
                                    setData("startDate", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label>End Date</Label>
                            <Input
                                type="date"
                                value={data.endDate || ""}
                                onChange={(e) =>
                                    setData("endDate", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Button type="submit" className="w-full">
                                Export
                            </Button>
                        </div>
                    </form>
                </PopoverContent>
            </Popover>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Transactions
                </h2>
            }
        >
            <Head title="Transactions" />
            <Card>
                <CardHeader className="flex justify-between flex-row">
                    <div>
                        <CardTitle>Transactions</CardTitle>
                        <CardDescription>
                            View and manage gym transactions
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <ExportTransaction />
                        <TransactionFilter />
                        <TransactionDialog />
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Shadcn Tabs */}
                    <Tabs value={currentTab} onValueChange={switchTab}>
                        <div className="flex justify-between">
                            <TabsList>
                                <TabsTrigger value="registrations">
                                    Registrations
                                </TabsTrigger>
                                <TabsTrigger value="renewals">
                                    Renewals
                                </TabsTrigger>
                                <TabsTrigger value="lockers">
                                    Lockers
                                </TabsTrigger>
                                <TabsTrigger value="miscellaneous">
                                    Miscellaneous
                                </TabsTrigger>
                                <TabsTrigger value="refunds">
                                    Refunds
                                </TabsTrigger>
                                <TabsTrigger value="expenses">
                                    Expenses
                                </TabsTrigger>
                                <TabsTrigger value="credits">
                                    Credits
                                </TabsTrigger>
                            </TabsList>
                            <span>
                                showing {data.data.length} of {data.total}{" "}
                                records
                            </span>
                        </div>
                        {loading ? (
                            <div className="flex justify-center items-center my-10">
                                <Loader size="lg" />
                            </div>
                        ) : (
                            <>
                                {/* Render the appropriate content for each tab */}
                                {currentTab === "registrations" &&
                                    renderRegistrationTable(data)}
                                {currentTab === "renewals" &&
                                    renderRenewalsTable(data)}
                                {currentTab === "lockers" &&
                                    renderLockerTable(data)}
                                {currentTab === "miscellaneous" &&
                                    renderMiscellaneousTable(data)}
                                {currentTab === "refunds" &&
                                    renderRefundTable(data)}
                                {currentTab === "expenses" &&
                                    renderExpenseTable(data)}
                                {currentTab === "credits" &&
                                    renderCreditTable(data)}

                                {/* Render Pagination */}
                                <div className="flex justify-end mt-4 space-x-2">
                                    {data.links.map((link: any) => (
                                        <Button
                                            key={link.url}
                                            onClick={() =>
                                                handlePagination(link.url)
                                            }
                                            variant={
                                                link.active
                                                    ? "default"
                                                    : "ghost"
                                            }
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </Tabs>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}

function renderRegistrationTable(data: any) {
    return (
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Member Name</TableHead>
                        <TableHead>Membership Package</TableHead>
                        <TableHead>Bill No.</TableHead>
                        <TableHead>Package Amount</TableHead>
                        <TableHead>Extra Discount</TableHead>
                        <TableHead>Net Amount</TableHead>
                        <TableHead>Paid Amount</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Payment Mode</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.data.map((registration: any) => {
                        const balance =
                            Number(registration.net_amount) -
                            Number(registration.paid_amount);
                        return (
                            <TableRow key={registration.id}>
                                <TableCell>
                                    {format(
                                        new Date(registration.payment_date),
                                        "yyyy-MM-dd"
                                    )}
                                </TableCell>
                                <TableCell>
                                    {registration.member.name}
                                </TableCell>
                                <TableCell>
                                    {
                                        registration.member.membership_package
                                            .package_name
                                    }
                                </TableCell>
                                <TableCell>
                                    <Badge className="text-xs">
                                        {registration.bill_number}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    Rs{" "}
                                    {Number(registration.total_monthly_fees) +
                                        Number(registration.admission_fees) -
                                        Number(registration.package_discount)}
                                </TableCell>
                                <TableCell>
                                    Rs {Number(registration.extra_discount)}
                                </TableCell>
                                <TableCell>
                                    Rs {Number(registration.net_amount)}
                                </TableCell>
                                <TableCell>
                                    Rs {Number(registration.paid_amount)}
                                </TableCell>
                                <TableCell>
                                    {balance > 0 ? (
                                        <span className="text-red-500">
                                            Rs {balance}{" "}
                                            <sub>
                                                <b>CR</b>
                                            </sub>
                                        </span>
                                    ) : balance < 0 ? (
                                        <span className="text-green-500">
                                            Rs {Math.abs(balance)}{" "}
                                            <sup>
                                                <b>ADV</b>
                                            </sup>
                                        </span>
                                    ) : (
                                        <span>Rs 0</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {registration.payment_mode}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </CardContent>
    );
}

function renderLockerTable(data: any) {
    return (
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Member Name</TableHead>
                        <TableHead>Locker No.</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Bill Number</TableHead>
                        <TableHead>Locker Charge</TableHead>
                        <TableHead>Locker Discount</TableHead>
                        <TableHead>Net Amount</TableHead>
                        <TableHead>Paid Amount</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Payment Mode</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.data.map((lockerPayment: any) => {
                        const credit =
                            Number(lockerPayment.net_amount) -
                            Number(lockerPayment.paid_amount); // Calculate credit
                        const duration =
                            lockerPayment.total_months === 1
                                ? "1 Month"
                                : `${lockerPayment.total_months} Months`; // Adjust duration grammar

                        return (
                            <TableRow key={lockerPayment.id}>
                                <TableCell>
                                    {new Date(
                                        lockerPayment.payment_date
                                    ).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    {lockerPayment.member?.name || "Unknown"}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={"outline"}
                                        className="text-primary border-primary"
                                    >
                                        <strong>
                                            {lockerPayment.locker_number}
                                        </strong>
                                    </Badge>
                                </TableCell>
                                <TableCell>{duration}</TableCell>{" "}
                                {/* Display grammatically correct duration */}
                                <TableCell>
                                    <Badge>{lockerPayment.bill_number}</Badge>
                                </TableCell>
                                <TableCell>
                                    Rs {Number(lockerPayment.locker_charge)}
                                </TableCell>
                                <TableCell>
                                    Rs {Number(lockerPayment.locker_discount)}
                                </TableCell>
                                <TableCell>
                                    Rs {Number(lockerPayment.net_amount)}
                                </TableCell>
                                <TableCell>
                                    Rs {Number(lockerPayment.paid_amount)}
                                </TableCell>
                                <TableCell>
                                    {credit > 0 ? (
                                        <span className="text-red-500">
                                            Rs {credit}{" "}
                                            <sub>
                                                <b>CR</b>
                                            </sub>{" "}
                                            {/* Credit */}
                                        </span>
                                    ) : credit < 0 ? (
                                        <span className="text-green-500">
                                            Rs {Math.abs(credit)}{" "}
                                            <sup>
                                                <b>ADV</b>
                                            </sup>{" "}
                                            {/* Advance */}
                                        </span>
                                    ) : (
                                        <span>Rs 0</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {lockerPayment.payment_mode}
                                </TableCell>{" "}
                                {/* Expiry Date */}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </CardContent>
    );
}

function renderRenewalsTable(data: any) {
    return (
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Member Name</TableHead>
                        <TableHead>Membership Package</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Bill No.</TableHead>
                        <TableHead>Package Amount</TableHead>
                        <TableHead>Extra Discount</TableHead>
                        <TableHead>Net Amount</TableHead>
                        <TableHead>Paid Amount</TableHead>
                        <TableHead>Payment Mode</TableHead>
                        <TableHead>Balance</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.data.map((renewal: any) => {
                        const balance =
                            Number(renewal.monthly_fees) *
                                Number(renewal.total_months) -
                            Number(renewal.extra_discount) -
                            Number(renewal.package_discount) -
                            Number(renewal.paid_amount);
                        const duration =
                            renewal.total_months === 1
                                ? "1 Month"
                                : `${renewal.total_months} Months`; // Adjust duration grammar

                        return (
                            <TableRow key={renewal.id}>
                                <TableCell>
                                    {format(
                                        new Date(
                                            renewal.payment_date
                                        ).toLocaleDateString(),
                                        "yyyy-MM-dd"
                                    )}
                                </TableCell>
                                <TableCell>{renewal.member.name}</TableCell>
                                <TableCell>
                                    {
                                        renewal.member.membership_package
                                            .package_name
                                    }
                                </TableCell>
                                <TableCell>{duration}</TableCell>{" "}
                                {/* Display grammatically correct duration */}
                                <TableCell>
                                    <Badge className="text-xs">
                                        {renewal.bill_number}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    Rs{" "}
                                    {Number(renewal.monthly_fees) *
                                        Number(renewal.total_months) -
                                        Number(renewal.package_discount)}
                                </TableCell>
                                <TableCell>
                                    Rs {Number(renewal.extra_discount)}
                                </TableCell>
                                <TableCell>
                                    Rs {Number(renewal.net_amount)}
                                </TableCell>
                                <TableCell>
                                    Rs {Number(renewal.paid_amount)}
                                </TableCell>
                                <TableCell>{renewal.payment_mode}</TableCell>
                                <TableCell>
                                    {balance > 0 ? (
                                        <span className="text-red-500">
                                            Rs {balance}{" "}
                                            <sub>
                                                <b>CR</b>
                                            </sub>
                                        </span>
                                    ) : balance < 0 ? (
                                        <span className="text-green-500">
                                            Rs {Math.abs(balance)}{" "}
                                            <sup>
                                                <b>ADV</b>
                                            </sup>
                                        </span>
                                    ) : (
                                        <span>Rs 0</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </CardContent>
    );
}

function renderMiscellaneousTable(data: any) {
    return (
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Credit</TableHead>
                        <TableHead>Transaction Type</TableHead>
                        <TableHead>Bill No.</TableHead>
                        <TableHead>Payment Mode</TableHead>
                        <TableHead>Description</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.data.map((transaction: any) => (
                        <TableRow key={transaction.id}>
                            <TableCell>
                                {format(
                                    new Date(
                                        transaction.payment_date
                                    ).toLocaleDateString(),
                                    "yyyy-MM-dd"
                                )}
                            </TableCell>
                            <TableCell>
                                {transaction.name || transaction.member?.name}
                            </TableCell>
                            <TableCell>
                                Rs {Number(transaction.total_amount)}
                            </TableCell>
                            <TableCell>
                                Rs {Number(transaction.paid_amount)}
                            </TableCell>
                            <TableCell>
                                Rs{" "}
                                {transaction.total_amount -
                                    transaction.paid_amount}
                            </TableCell>
                            <TableCell>
                                {transaction.transaction_type}
                            </TableCell>
                            <TableCell>
                                <Badge>
                                    {transaction.bill_number || "N/A"}
                                </Badge>
                            </TableCell>
                            <TableCell>{transaction.payment_mode}</TableCell>
                            <TableCell>
                                {transaction?.description?.length > 0
                                    ? (
                                          transaction.description as string
                                      ).substring(0, 50)
                                    : ""}
                                {transaction?.description?.length > 50
                                    ? "..."
                                    : ""}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    );
}

function renderRefundTable(data: any) {
    return (
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Member Name</TableHead>
                        <TableHead>Refund Amount</TableHead>
                        <TableHead>PV No.</TableHead>
                        <TableHead>Payment Mode</TableHead>
                        <TableHead>Description</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.data.map((transaction: any) => (
                        <TableRow key={transaction.id}>
                            <TableCell>
                                {format(
                                    new Date(
                                        transaction.payment_date
                                    ).toLocaleDateString(),
                                    "yyyy-MM-dd"
                                )}
                            </TableCell>
                            <TableCell>{transaction.member?.name}</TableCell>
                            <TableCell>
                                Rs {Number(transaction.refund_amount)}
                            </TableCell>
                            <TableCell>
                                <Badge>
                                    {transaction.payment_voucher || "N/A"}
                                </Badge>
                            </TableCell>
                            <TableCell>{transaction.payment_mode}</TableCell>
                            <TableCell>
                                {transaction?.description?.length > 0
                                    ? (
                                          transaction.description as string
                                      ).substring(0, 50)
                                    : ""}
                                {transaction?.description?.length > 50
                                    ? "..."
                                    : ""}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    );
}

function renderExpenseTable(data: any) {
    return (
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Expense Amount</TableHead>
                        <TableHead>Expense Type</TableHead>
                        <TableHead>PV No.</TableHead>
                        <TableHead>Payment Mode</TableHead>
                        <TableHead>Description</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.data.map((transaction: any) => (
                        <TableRow key={transaction.id}>
                            <TableCell>
                                {format(
                                    new Date(
                                        transaction.payment_date
                                    ).toLocaleDateString(),
                                    "yyyy-MM-dd"
                                )}
                            </TableCell>
                            <TableCell>{transaction.name}</TableCell>
                            <TableCell>
                                Rs {Number(transaction.expense_amount)}
                            </TableCell>
                            <TableCell>{transaction.expense_type}</TableCell>
                            <TableCell>
                                <Badge>
                                    {transaction.payment_voucher || "N/A"}
                                </Badge>
                            </TableCell>
                            <TableCell>{transaction.payment_mode}</TableCell>
                            <TableCell>
                                {transaction?.description?.length > 0
                                    ? (
                                          transaction.description as string
                                      ).substring(0, 50)
                                    : ""}
                                {transaction?.description?.length > 50
                                    ? "..."
                                    : ""}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    );
}

function renderCreditTable(data: any) {
    const members = data.data || [];

    const handleSendCreditMessage = async (member: Member) => {
        try {
            router.post(route("transactions.send-credit-message", member.id));
            toast({
                description: `Message sent to ${member.name} successfully...`,
            });
        } catch (error) {
            console.error("Error sending credit message:", error);
        }
    };

    return (
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Member Image</TableHead>
                        <TableHead>Membership ID</TableHead>
                        <TableHead>Member Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Credit</TableHead>
                        <TableHead>Message</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {members.map((member: Member) => (
                        <TableRow key={member.id}>
                            <TableCell>
                                <img
                                    src={member?.photo as string}
                                    className="w-14 h-14 sm:w-10 sm:h-10 object-cover rounded-full border-2 border-primary p-0.5"
                                    alt="Member"
                                />
                            </TableCell>
                            <TableCell>{member?.id}</TableCell>
                            <TableCell>{member?.name}</TableCell>
                            <TableCell>{member?.phone}</TableCell>
                            <TableCell>
                                {member?.status?.toLowerCase() === "active" ? (
                                    <Badge className="bg-green-500 hover:bg-green-600">
                                        Active
                                    </Badge>
                                ) : member?.status?.toLowerCase() ===
                                  "unapproved" ? (
                                    <Badge className="bg-orange-500 hover:bg-orange-600">
                                        Unapproved
                                    </Badge>
                                ) : (
                                    <Badge className="bg-red-500 hover:bg-red-600">
                                        {member?.status || "Unknown"}
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell>Rs {Number(member.credit)}</TableCell>
                            <TableCell>
                                <Send
                                    className="hover:scale-110"
                                    onClick={() =>
                                        handleSendCreditMessage(member)
                                    }
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    );
}
