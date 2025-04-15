import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage, Link } from "@inertiajs/react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import moment from "moment";
import { Badge } from "@/Components/ui/badge";
import { MembershipPackage, PageProps } from "@/types";
import { Member } from "@/types/members";
import { Button } from "@/Components/ui/button";
import MemberTableActions from "./actionMenuBlocks";
import FilterPopover from "./FilterPopover";
import { Input } from "@/Components/ui/input";
import { AccessControl } from "@/types/access-controls";

export default function Members() {
    const { auth, members, accessControl, packages } = usePage<
        PageProps<{
            packages: MembershipPackage[];
            accessControl: AccessControl;
            members: {
                data: Member[];
                links: any[];
                current_page: number;
                total: number;
            };
        }>
    >().props;

    const pagination = {
        currentPage: members.current_page,
        links: members.links,
        total: members.total,
    };

    const handlePageChange = (pageNumber: number | null) => {
        if (pageNumber !== null) {
            router.get(`/members`, { page: pageNumber });
        }
    };

    const url = usePage().url;

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            const target = e.target as HTMLInputElement;
            return router.visit("/members?filter[search]=" + target.value);
        }
    };

    const params = new URLSearchParams(window.location.search);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Members
                </h2>
            }
        >
            <Head title="Members" />
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-center gap-2">
                    <div className="grow">
                        <Input
                            type="search"
                            placeholder="Search Members Here..."
                            onKeyDown={handleSearch}
                            defaultValue={params.get("filter[search]") || ""}
                        />
                    </div>
                    <div className="flex gap-1">
                        <FilterPopover packages={packages} />
                        <Link href="/members/create">
                            <Button>Add Member</Button>
                        </Link>
                    </div>
                </div>

                {/* Members Table */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Member Image</TableHead>
                            <TableHead>Membership ID</TableHead>
                            <TableHead>Member Name</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Joining Date</TableHead>
                            <TableHead>Payment Expiry Date</TableHead>
                            <TableHead>Membership Package</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.data.map((member: Member) => (
                            <TableRow key={member?.id}>
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
                                    {member?.start_date
                                        ? moment(member.start_date).format("LL")
                                        : "N/A"}
                                </TableCell>
                                <TableCell>
                                    {member?.payment_expiry_date
                                        ? moment(
                                              member.payment_expiry_date
                                          ).format("LL")
                                        : "N/A"}
                                    <small className="block text-muted-foreground font-bold">
                                        {member?.payment_expiry_date
                                            ? moment(
                                                  member.payment_expiry_date
                                              ).fromNow()
                                            : ""}
                                    </small>
                                </TableCell>
                                <TableCell>
                                    {member?.membership_package?.package_name ||
                                        "N/A"}
                                </TableCell>
                                <TableCell>
                                    {member?.status?.toLowerCase() ===
                                    "active" ? (
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
                                <TableCell>
                                    <MemberTableActions
                                        member={member}
                                        accessControl={accessControl}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Pagination */}
                <div className="py-2 flex justify-end space-x-2">
                    {pagination.links.map((link, index) => {
                        return (
                            <Link key={index} href={link.url ?? "#"}>
                                <Button
                                    key={index}
                                    disabled={link.active}
                                    variant={link.active ? "default" : "ghost"}
                                >
                                    {link.label
                                        .replace("&laquo;", "«")
                                        .replace("&raquo;", "»")}
                                </Button>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
