import { Button } from "@/Components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Textarea } from "@/Components/ui/textarea";
import { Member } from "@/types/members";
import { useForm } from "@inertiajs/react";
import { FormEvent, useState } from "react";

export function SendMessageDialog({ member, open, onClose }: { member: Member, open: boolean, onClose: () => void }) {

    const { post, data, setData, processing } = useForm({
        message: "",
        contacts: [member.phone]
    });

    const [totalPages, setTotalPages] = useState(1);
    const [totalDisplayCharacters, setTotalDisplayCharacters] = useState(160); // Default to GSM-7 for single page

    const getUtf16ByteLength = (str: string) => {
        let byteLength = 0;
        for (let i = 0; i < str.length; i++) {
            const charCode = str.charCodeAt(i);
            byteLength += (charCode > 0xFFFF) ? 4 : 2; // UTF-16 encoding takes 2 or 4 bytes per character
        }
        return byteLength;
    };

    const handleMessageChange = (message: string) => {
        const utf16Length = getUtf16ByteLength(message);
        const totalCharacters = utf16Length / 2; // Since each character takes 2 bytes in UTF-16, divide by 2

        const isUnicode = message.match(/[^\u0000-\u007F]/) !== null; // Check if the message contains Unicode characters (non-ASCII)

        let totalPageLimit: number;
        let totalPages: number;

        if (isUnicode) {
            // Unicode (UCS-2) Encoding Rules
            if (totalCharacters <= 70) {
                // Single page for Unicode: 70 characters
                totalPageLimit = 70;
                totalPages = 1;
            } else {
                // Multi-part message: 67 characters per page
                totalPages = Math.ceil(totalCharacters / 67);
                totalPageLimit = totalPages * 67; // Each page holds 67 characters
            }
        } else {
            // GSM-7 (Plain text) Encoding Rules
            if (totalCharacters <= 160) {
                // Single page for plain text: 160 characters
                totalPageLimit = 160;
                totalPages = 1;
            } else {
                // Multi-part message: 153 characters per page
                totalPages = Math.ceil(totalCharacters / 153);
                totalPageLimit = totalPages * 153; // Each page holds 153 characters
            }
        }

        setTotalPages(totalPages);
        setTotalDisplayCharacters(totalPageLimit); // Update the total allowed characters based on pages
        setData('message', message);
    };

    function onSubmit(e: FormEvent) {
        e.preventDefault();
    
        // Validation for message
        if (!data.message || data.message.trim() === "") {
            alert("Message cannot be empty.");
            return;
        }
    
        // Validation for contacts
        if (!data.contacts || data.contacts.length === 0 || data.contacts.some(contact => !isValidPhone(contact))) {
            alert("Please provide at least one valid contact.");
            return;
        }
    
        console.log(data.message);
        console.log(data.contacts);
        
        if (processing) return;
    
        post(`/send-message`, {
            onSuccess: () => {
                onClose();
            }
        });
    }
    
    // Utility function to validate phone numbers
    const isValidPhone = (phone: string) => {
        const phoneRegex = /^[0-9]{10,15}$/; // Example: Adjust regex for your valid phone format
        return phoneRegex.test(phone);
    };
    

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Send Message to {member.name}...</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-3">
                    <div>
                        <Textarea
                            value={data.message}
                            onChange={e => handleMessageChange(e.target.value)}
                            placeholder="Type your message here..."
                        />
                        <div className="text-sm text-muted-foreground mt-2 flex justify-between">
                            <span>Total Pages: {totalPages}</span>
                            <span>{data.message.length} / {totalDisplayCharacters}</span>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {
                                processing ? "Processing..." : "Send Message"
                            }
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
