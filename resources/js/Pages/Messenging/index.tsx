import InputError from "@/Components/InputError";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { MembershipPackage, PageProps } from "@/types";
import { useForm, router } from "@inertiajs/react";
import { FormEvent, useState, useEffect } from "react";
import { toast } from "@/Components/ui/use-toast";
import FilterDialog from "./FilterDialog";

const index = ({
    auth,
    sms_balance,
    packages,
    contacts,
    recipientType,
    error,
    ...otherProps
}: PageProps<{
    sms_balance: number;
    packages: MembershipPackage[];
    contacts: string[];
    recipientType?: string;
    error?: string;
    [key: string]: any;
}>) => {
    const { data, setData, errors, post, processing, reset } = useForm({
        contacts: contacts || [],
        message: "",
        recipient_type: recipientType || "members",
    });

    const [totalPages, setTotalPages] = useState(1);
    const [totalDisplayCharacters, setTotalDisplayCharacters] = useState(160);
    const [isLoadingContacts, setIsLoadingContacts] = useState(false);

    // Extract filter values from props to pass to FilterDialog
    const initialFilters = Object.keys(otherProps)
        .filter(
            (key) =>
                key.startsWith("member_") ||
                key.startsWith("official_") ||
                key === "membership_package_id" ||
                key === "position"
        )
        .reduce((acc, key) => {
            acc[key] = otherProps[key];
            return acc;
        }, {} as Record<string, string>);

    // Display error toast if there was an error
    useEffect(() => {
        if (error) {
            toast({
                title: "Error",
                description: error,
                variant: "destructive",
            });
        }
    }, [error]);

    // Update contacts when they change from props
    useEffect(() => {
        if (contacts && contacts.length > 0) {
            console.log("Received contacts:", contacts);
            setData("contacts", contacts);
        }
    }, [contacts]);

    // Update recipient type when it changes from props
    useEffect(() => {
        if (recipientType) {
            setData("recipient_type", recipientType);
        }
    }, [recipientType]);

    // Debug log for data changes
    useEffect(() => {
        console.log("Form data updated:", data);
    }, [data]);

    const handleMessageChange = (message: string) => {
        const totalCharacters = message.length;
        const totalPages = Math.max(Math.ceil(totalCharacters / 160), 1);
        setTotalPages(totalPages);
        setTotalDisplayCharacters(totalPages * 160);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault(); // Prevent default form submission behavior

        // Validate data before submission
        if (!data.contacts.length || !data.message.trim()) {
            toast({
                title: "Validation Error",
                description: "Contacts and Message are required",
                variant: "destructive",
            });
            return;
        }

        // Proceed with submission
        post("/send-message", {
            onSuccess: () => {
                // Clear the form fields upon successful submission
                toast({
                    title: "Success",
                    description: "Message sent successfully",
                });
                reset();
                setTotalPages(1); // Reset total pages
                setTotalDisplayCharacters(160); // Reset display characters
            },
            onError: (errors) => {
                toast({
                    title: "Error",
                    description:
                        "Failed to send message: " +
                        Object.values(errors).join(", "),
                    variant: "destructive",
                });
            },
        });
    };

    // Helper to generate the contacts display value
    const getContactsDisplayValue = () => {
        return Array.isArray(data.contacts) && data.contacts.length > 0
            ? data.contacts.join(", ")
            : "";
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <header className="flex justify-between">
                <h1 className="text-xl font-semibold">Send Message</h1>
                {sms_balance < 0 ? (
                    <span className="text-muted-foreground">
                        SMS service unavailable
                    </span>
                ) : (
                    <span className="text-card-foreground">
                        Balance: Rs {sms_balance}
                    </span>
                )}
            </header>

            <div className="flex justify-end mt-4">
                <FilterDialog
                    packages={packages}
                    initialRecipientType={recipientType}
                    initialFilters={initialFilters}
                />
            </div>

            <form className="space-y-3 mt-4" onSubmit={handleSubmit}>
                <div>
                    <Label htmlFor="contacts">Contacts</Label>
                    <Textarea
                        id="contacts"
                        required
                        value={getContactsDisplayValue()}
                        onChange={(e) =>
                            setData(
                                "contacts",
                                e.target.value
                                    ? e.target.value
                                          .split(",")
                                          .map((c) => c.trim())
                                    : []
                            )
                        }
                        placeholder="Comma Separated contact numbers"
                        disabled={isLoadingContacts}
                    />
                    <InputError message={errors.contacts} />
                    <div className="flex justify-between text-muted-foreground text-sm mt-1">
                        <div>
                            {Array.isArray(data.contacts) && (
                                <span>
                                    {data.contacts.length} contact(s) selected
                                </span>
                            )}
                        </div>
                        {isLoadingContacts && <span>Loading contacts...</span>}
                    </div>
                </div>
                <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                        id="message"
                        required
                        value={data.message}
                        onChange={(e) => {
                            setData("message", e.target.value);
                            handleMessageChange(e.target.value);
                        }}
                        placeholder="Enter message to the recipients"
                    />
                    <InputError message={errors.message} />
                    <div className="text-muted-foreground mt-2 flex justify-between">
                        <span>
                            Total Pages: {totalPages} - (Rs{" "}
                            {(
                                totalPages *
                                (Array.isArray(data.contacts)
                                    ? data.contacts.length
                                    : 0) *
                                1.4
                            ).toFixed(2)}
                            )
                        </span>
                        <span>
                            {data.message.length} / {totalDisplayCharacters}
                        </span>
                    </div>
                </div>
                <Button
                    type="submit"
                    disabled={
                        sms_balance <= 0 ||
                        processing ||
                        isLoadingContacts ||
                        !data.contacts.length
                    }
                >
                    Send SMS Alert
                </Button>
            </form>
        </AuthenticatedLayout>
    );
};

export default index;
