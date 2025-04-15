import { usePage, useForm, router } from "@inertiajs/react";
import React, { useState } from "react";
import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { toast } from "@/Components/ui/use-toast";
import { AccessControl } from "@/types/access-controls";
import { Pencil } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

const EditAccessControlDialog = ({ control }: { control: AccessControl }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Using useForm from Inertia.js for form handling
    const { data, setData, post, processing, reset, errors, clearErrors } =
        useForm({
            name: control.name,
            type: control.type,
            uuid: control.uuid,
            ip_address: control.ip_address.toString(),
            username: control.username,
            password: "",
            port: "80",
            description: control.description,
        });

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        clearErrors();

        router.put(
            route("settings.updateAccessControl", control.id),
            { ...data },
            {
                onSuccess: () => {
                    toast({
                        title: "Success",
                        description: "Access Control updated successfully",
                    });
                    setIsOpen(false);
                    setData("password", "");
                },
                onError: () => {
                    toast({
                        title: "Error",
                        description: "Failed to update Access Control",
                        variant: "destructive",
                    });
                },
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button className="text-sm me-5 text-muted-foreground flex gap-1">
                    <Pencil size={15} />
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Access Control</DialogTitle>
                </DialogHeader>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Type */}
                    <div>
                        <Label htmlFor="type">System Type</Label>
                        <Select
                            value={data.type}
                            onValueChange={(val) => setData("type", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select System Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="public_url">
                                        Public URL
                                    </SelectItem>
                                    <SelectItem value="isup">ISUP</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Name */}
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="Enter name"
                            disabled={processing}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {/* IP Address */}
                        <div className="grow">
                            <Label htmlFor="ip_address">IP Address</Label>
                            <Input
                                id="ip_address"
                                value={data.ip_address}
                                onChange={(e) =>
                                    setData("ip_address", e.target.value)
                                }
                                placeholder="192.168.0.1"
                                disabled={processing}
                            />
                            {errors.ip_address && (
                                <p className="text-red-500 text-sm">
                                    {errors.ip_address}
                                </p>
                            )}
                        </div>
                        {/* Port */}
                        <div className="grow max-w-28">
                            <Label htmlFor="port">Port</Label>
                            <Input
                                id="port"
                                value={data.port}
                                onChange={(e) =>
                                    setData("port", e.target.value)
                                }
                                placeholder="80"
                                type="number"
                                disabled={processing}
                            />
                            {errors.port && (
                                <p className="text-red-500 text-sm">
                                    {errors.port}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {/* Username */}
                        <div className="grow">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={data.username}
                                onChange={(e) =>
                                    setData("username", e.target.value)
                                }
                                placeholder="admin"
                                disabled={processing}
                            />
                            {errors.username && (
                                <p className="text-red-500 text-sm">
                                    {errors.username}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="grow">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="text"
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                placeholder="Enter password"
                                disabled={processing}
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm">
                                    {errors.password}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Render UUID field if type is "isup" */}
                    {data.type == "isup" && (
                        <div>
                            <Label htmlFor="uuid">UUID</Label>
                            <Input
                                id="uuid"
                                type="text"
                                value={data.uuid}
                                onChange={(e) =>
                                    setData("uuid", e.target.value)
                                }
                                placeholder="Enter UUID"
                                disabled={processing}
                            />
                            {errors.uuid && (
                                <p className="text-red-500 text-sm">
                                    {errors.uuid}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                            placeholder="Description"
                            disabled={processing}
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full mt-4"
                    >
                        {processing ? "Saving..." : "Save"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditAccessControlDialog;
