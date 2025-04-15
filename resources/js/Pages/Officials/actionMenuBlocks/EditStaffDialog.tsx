import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/Components/ui/sheet";
import { toast } from "@/Components/ui/use-toast";
import { capitalizeWords } from "@/lib/utils";
import { Official } from "@/types";
import { useForm } from "@inertiajs/react";
import axios from "axios";
import moment from "moment";
import React, { FormEvent, useState } from "react";

const EditStaffDialog = ({ refetch, official, onClose }: { refetch: any, official: Official, onClose: () => void }) => {
    const { data, setData, reset } = useForm({
        name: official.name,
        phone: official.phone,
        photo: null as unknown as File,
        gender: official.gender,
        joining_date: moment(official.joining_date).format("YYYY-MM-DD"),
        is_active: 1,
        position: "",
    });

    const [processing, setProcessing] = useState(false);

    const submit = (e: FormEvent) => {
        e.preventDefault();

        setProcessing(true);

        axios.post(`/staffs/${official.id}`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
            .then(response => {
                toast({ description: "Staff updated successfully" });
                reset();
                refetch();
                onClose(); // Close dialog
            })
            .catch(error => {
                toast({ description: "Failed to update staff" });
            })
            .finally(() => {
                setProcessing(false);
            });
    };

    return (
        <Sheet open={true} onOpenChange={onClose}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Edit Staff</SheetTitle>
                    <SheetDescription>Customize the staff as per your choice</SheetDescription>
                </SheetHeader>
                <form className="space-y-2" onSubmit={submit}>
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            type="text"
                            id="name"
                            value={data.name}
                            onChange={e => setData("name", capitalizeWords(e.target.value))}
                        />
                    </div>
                    <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            type="tel"
                            id="phone"
                            value={data.phone}
                            onChange={e => setData("phone", e.target.value)}
                            maxLength={10}
                            minLength={10}
                        />
                    </div>
                    <div>
                        <div className="flex justify-between">
                            <Label htmlFor="photo">Photo</Label>
                            <span className="text-muted-foreground text-xs font-bold">
                                Leave as it is to keep unchanged
                            </span>
                        </div>
                        <Input
                            type="file"
                            id="photo"
                            accept="image/*"
                            onChange={e => {
                                if (e.target.files?.length)
                                    setData("photo", e.target.files[0]);
                                else
                                    setData("photo", null as unknown as File);
                            }}
                        />
                    </div>
                    <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                            defaultValue={official.gender}
                            onValueChange={val => setData("gender", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a Gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="joining_date">Joining Date</Label>
                        <Input
                            type="date"
                            id="joining_date"
                            value={data.joining_date}
                            onChange={e => setData("joining_date", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="position">Position</Label>
                        <Select onValueChange={val => setData("position", val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a Position" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="Owner">Owner</SelectItem>
                                    <SelectItem value="Manager">Manager</SelectItem>
                                    <SelectItem value="Trainer">Trainer</SelectItem>
                                    <SelectItem value="Reception">Reception</SelectItem>
                                    <SelectItem value="Guard">Guard</SelectItem>
                                    <SelectItem value="House-Keeping">House Keeping</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Button type="submit" disabled={processing}>
                            {processing ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
};

export default EditStaffDialog;
