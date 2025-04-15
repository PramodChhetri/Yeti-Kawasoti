import InputError from "@/Components/InputError";
import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import SingleImageUploader from "@/Components/ui/SingleImageUploader";
import { Textarea } from "@/Components/ui/textarea";
import { toast } from "@/Components/ui/use-toast";
import { capitalizeWords } from "@/lib/utils";
import { Member } from "@/types/members";
import { useForm } from "@inertiajs/react";
import { Loader2 } from "lucide-react";
import { useState, FormEvent } from "react";

export function EditMemberDialog({
    member,
    open,
    onClose,
}: {
    member: Member;
    open: boolean;
    onClose: () => void;
}) {
    const [imageURL, setImageURL] = useState<string>(
        typeof member.photo === "string" ? member.photo : ""
    );

    interface FormData {
        name: string;
        phone: string;
        gender: "male" | "female" | "other";
        marital_status: "single" | "married";
        date_of_birth: Date | undefined;
        start_date: Date | undefined;
        occupation: string;
        address: string;
        preferred_time: string;
        photo: File | null;
        payment_expiry_date: Date | undefined;
        remarks: string;
        emergency_person_name: string;
        emergency_person_phone: string;
    }

    const [loading, setLoading] = useState(false);

    const { data, setData, errors, processing, setError, post } =
        useForm<FormData>({
            name: member.name,
            marital_status: member.marital_status,
            date_of_birth: member.date_of_birth,
            start_date: member.start_date,
            gender: member.gender,
            phone: member.phone,
            preferred_time: member.preferred_time,
            occupation: member.occupation,
            address: member.address,
            photo: null as unknown as File,
            payment_expiry_date: member.payment_expiry_date,
            remarks: member.remarks,
            emergency_person_name: member.emergency_person_name || "", // Adding emergency contact person name
            emergency_person_phone: member.emergency_person_phone || "", // Adding emergency contact phone
        });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        post(`/member/${member.id}`, {
            onSuccess: () => {
                toast({ description: "Member updated successfully..." });
                onClose();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[99vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle>Edit Member Information</DialogTitle>
                    <DialogDescription>
                        Efficiently manage and update membership details in this
                        section
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid sm:grid-cols-2 gap-x-3">
                        <div className="col-span-full flex flex-col sm:flex-row gap-x-5 items-center">
                            <div
                                className="relative size-36"
                                onClick={() =>
                                    document
                                        .getElementById("photo-input")
                                        ?.click()
                                }
                            >
                                <SingleImageUploader
                                    onImageUpload={(file) =>
                                        setData("photo", file)
                                    }
                                    imageView="cover"
                                    currentImage={member.photo as string}
                                    className="w-full min-w-[100px] h-full"
                                    required={false}
                                />
                            </div>
                            <div className="grow w-full">
                                <div className="mb-4">
                                    <InputError message={errors.photo} />

                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData(
                                                "name",
                                                capitalizeWords(e.target.value)
                                            )
                                        }
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid sm:grid-cols-2 gap-x-3 grow w-full">
                                    <div>
                                        <Label htmlFor="occupation">
                                            Occupation
                                        </Label>
                                        <Select
                                            defaultValue={data.occupation}
                                            onValueChange={(val) =>
                                                setData("occupation", val)
                                            }
                                        >
                                            <SelectTrigger id="occupation">
                                                <SelectValue placeholder="Select occupation" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="private-job">
                                                    Private Job
                                                </SelectItem>
                                                <SelectItem value="government-job">
                                                    Government Job
                                                </SelectItem>
                                                <SelectItem value="business">
                                                    Business
                                                </SelectItem>
                                                <SelectItem value="student">
                                                    Student
                                                </SelectItem>
                                                <SelectItem value="housewife">
                                                    House Wife
                                                </SelectItem>
                                                <SelectItem value="other">
                                                    Other
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={errors.occupation}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <Label htmlFor="phone">
                                            Phone Number
                                        </Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            value={data.phone}
                                            onChange={(e) =>
                                                setData("phone", e.target.value)
                                            }
                                            maxLength={10}
                                            minLength={10}
                                        />
                                        <InputError message={errors.phone} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-full">
                            <div className="grid sm:grid-cols-3 gap-x-3">
                                <div className="mb-4">
                                    <Label htmlFor="gender">Gender</Label>
                                    <Select
                                        onValueChange={(
                                            value: Member["gender"]
                                        ) => setData("gender", value)}
                                        defaultValue={data.gender}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Please select Gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">
                                                Male
                                            </SelectItem>
                                            <SelectItem value="female">
                                                Female
                                            </SelectItem>
                                            <SelectItem value="other">
                                                Other
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.gender} />
                                </div>
                                <div className="mb-4">
                                    <Label htmlFor="marital_status">
                                        Marital Status
                                    </Label>
                                    <Select
                                        onValueChange={(
                                            value: Member["marital_status"]
                                        ) => setData("marital_status", value)}
                                        defaultValue={data.marital_status}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Please select Marital Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="single">
                                                Single
                                            </SelectItem>
                                            <SelectItem value="married">
                                                Married
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={errors.marital_status}
                                    />
                                </div>

                                <div className="mb-4">
                                    <Label htmlFor="preferred_time">
                                        Preferred Shift
                                    </Label>
                                    <Select
                                        onValueChange={(val) =>
                                            setData("preferred_time", val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select preferred shift" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Morning">
                                                Morning
                                            </SelectItem>
                                            <SelectItem value="Day">
                                                Day
                                            </SelectItem>
                                            <SelectItem value="Evening">
                                                Evening
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={errors.preferred_time}
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="grid col-span-full sm:grid-cols-3 gap-x-3">
                            <div className="mb-4">
                                <Label htmlFor="date_of_birth">
                                    Date of Birth
                                </Label>
                                <Input
                                    type="date"
                                    id="date_of_birth"
                                    defaultValue={
                                        new Date(data.date_of_birth as Date)
                                            .toISOString()
                                            .split("T")[0]
                                    }
                                    onChange={(e) =>
                                        setData(
                                            "date_of_birth",
                                            new Date(e.target.value)
                                        )
                                    }
                                />
                                <InputError message={errors.date_of_birth} />
                            </div>
                            <div className="mb-4">
                                <Label htmlFor="start_date">Joining Date</Label>
                                <Input
                                    type="date"
                                    id="start_date"
                                    defaultValue={
                                        new Date(data.start_date as Date)
                                            .toISOString()
                                            .split("T")[0]
                                    }
                                    onChange={(e) =>
                                        setData(
                                            "start_date",
                                            new Date(e.target.value)
                                        )
                                    }
                                />
                                <InputError message={errors.start_date} />
                            </div>
                            <div className="mb-4">
                                <Label htmlFor="payment_expiry_date">
                                    Payment Expiry Date
                                </Label>
                                <Input
                                    type="date"
                                    id="payment_expiry_date"
                                    defaultValue={
                                        new Date(
                                            data.payment_expiry_date as Date
                                        )
                                            .toISOString()
                                            .split("T")[0]
                                    }
                                    onChange={(e) =>
                                        setData(
                                            "payment_expiry_date",
                                            new Date(e.target.value)
                                        )
                                    }
                                />
                                <InputError
                                    message={errors.payment_expiry_date}
                                />
                            </div>
                        </div>

                        {/* Emergency Contact Fields */}
                        <div className="grid col-span-full sm:grid-cols-2 gap-x-3">
                            <div className="mb-4">
                                <Label htmlFor="emergency_person_name">
                                    Emergency Contact Person
                                </Label>
                                <Input
                                    id="emergency_person_name"
                                    name="emergency_person_name"
                                    value={data.emergency_person_name}
                                    onChange={(e) =>
                                        setData(
                                            "emergency_person_name",
                                            capitalizeWords(e.target.value)
                                        )
                                    }
                                />
                                <InputError
                                    message={errors.emergency_person_name}
                                />
                            </div>
                            <div className="mb-4">
                                <Label htmlFor="emergency_person_phone">
                                    Emergency Contact Phone
                                </Label>
                                <Input
                                    id="emergency_person_phone"
                                    name="emergency_person_phone"
                                    value={data.emergency_person_phone}
                                    onChange={(e) =>
                                        setData(
                                            "emergency_person_phone",
                                            e.target.value
                                        )
                                    }
                                    maxLength={10}
                                    minLength={10}
                                />
                                <InputError
                                    message={errors.emergency_person_phone}
                                />
                            </div>
                        </div>

                        <div className="mb-4 col-span-full">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                name="address"
                                value={data.address}
                                onChange={(e) =>
                                    setData(
                                        "address",
                                        capitalizeWords(e.target.value)
                                    )
                                }
                            />
                            <InputError message={errors.address} />
                        </div>

                        <div className="mb-4 col-span-full">
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea
                                id="remarks"
                                placeholder="Any remarks here..."
                                name="remarks"
                                value={data.remarks as string}
                                onChange={(e) =>
                                    setData("remarks", e.target.value)
                                }
                            />
                            <InputError message={errors.remarks} />
                        </div>

                        <div className="col-span-full text-right">
                            {processing ? (
                                <Button disabled className="w-full sm:w-fit">
                                    <Loader2 className="animate-spin" />
                                </Button>
                            ) : (
                                <Button className="w-full sm:w-fit">
                                    Update
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
