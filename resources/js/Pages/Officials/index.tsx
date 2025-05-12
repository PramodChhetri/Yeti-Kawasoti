import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { PageProps, Official } from "@/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import CreateDialog from "./actionMenuBlocks/CreateDialog";
import { Badge } from "@/Components/ui/badge";
import OfficialTableActions from "./actionMenuBlocks";

const index = ({ auth }: PageProps) => {
    const { data, status, refetch } = useQuery({
        queryKey: ["data"],
        queryFn: async () => {
            const response = await axios.get("/staffs/all");
            return response.data;
        },
        refetchInterval: 60 * 1000, // every minute
        staleTime: 10 * 1000, // 10 seconds
    });

    return (
        <Authenticated user={auth.user}>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center gap-5 flow-col flex-wrap">
                        <div>
                            <CardTitle>Our Officials</CardTitle>
                        </div>
                        <CreateDialog refetch={refetch} />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableCaption>
                            Total Staffs:{" "}
                            {status === "success" ? data?.length : "Loading..."}
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead />
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Joining Date</TableHead>
                                <TableHead>DOB</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(data as Official[])?.map((data) => {
                                return (
                                    <TableRow>
                                        <TableCell>
                                            <div className="relative h-14 w-14">
                                                <img
                                                    src={data.photo}
                                                    className="absolute inset-0 h-full w-full rounded-full border-2 border-primary object-cover"
                                                    alt="Official"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>{data.id}</TableCell>
                                        <TableCell>{data.name}</TableCell>
                                        <TableCell>{data.phone}</TableCell>
                                        <TableCell>
                                            {data.joining_date}
                                        </TableCell>
                                        <TableCell>{data.dob}</TableCell>
                                        <TableCell>{data.position}</TableCell>
                                        <TableCell>
                                            {" "}
                                            {data.status == "active" ? (
                                                <Badge variant={"default"}>
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant={"secondary"}
                                                    className="text-muted-foreground"
                                                >
                                                    Disabled
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <OfficialTableActions
                                                refetch={refetch}
                                                official={data}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </Authenticated>
    );
};

export default index;
