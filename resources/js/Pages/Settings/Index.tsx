import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/ui/tabs";
import { MembershipPackage, PageProps } from "@/types";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AddPackageDialog from "./AddPackageDialog";
import AddAccessControlDialog from "./AddAccessControlDialog";
import { AccessControl } from "@/types/access-controls";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import EditPackageDialog from "./EditPackageDialog";
import EditAccessControlDialog from "./EditAccessControlDialog";

const Index = ({
    auth,
    accessControls,
    packages,
}: PageProps<{ accessControls: any[]; packages: any[] }>) => {
    console.log(packages);
    return (
        <Authenticated user={auth.user}>
            <div className="container mx-auto p-6">
                {/* Tab-based layout for better UX on smaller screens */}
                <Tabs defaultValue="packages" className="w-full">
                    <TabsList>
                        <TabsTrigger value="packages">Packages</TabsTrigger>
                        <TabsTrigger value="access-controls">
                            Access Controls
                        </TabsTrigger>
                    </TabsList>

                    {/* Packages Tab */}
                    <TabsContent value="packages">
                        <Card className="w-full bg-background shadow-lg rounded-lg mb-6">
                            <CardHeader className="border-b border-border p-4">
                                <div className="flex justify-between flex-wrap">
                                    <CardTitle className="text-xl font-semibold">
                                        Packages
                                    </CardTitle>
                                    <AddPackageDialog />
                                </div>
                                <CardDescription className="text-muted-foreground">
                                    Manage access controls for gym packages and
                                    services.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Package Name</TableHead>
                                            <TableHead>
                                                Admission Amount
                                            </TableHead>
                                            <TableHead>
                                                Monthly Amount
                                            </TableHead>
                                            <TableHead>3 month Disc.</TableHead>
                                            <TableHead>6 month Disc.</TableHead>
                                            <TableHead>Yearly Disc.</TableHead>
                                            <TableHead>Months</TableHead>
                                            <TableHead>Device</TableHead>
                                            <TableHead />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {packages.map(
                                            (pkg: MembershipPackage) => (
                                                <TableRow key={pkg.id}>
                                                    <TableCell>
                                                        {pkg.package_name}
                                                    </TableCell>
                                                    <TableCell>
                                                        Rs{" "}
                                                        {Math.floor(
                                                            pkg.admission_amount
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        Rs{" "}
                                                        {Math.floor(
                                                            pkg.monthly_amount
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        Rs{" "}
                                                        {Math.floor(
                                                            pkg.discount_quarterly ??
                                                                0
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        Rs{" "}
                                                        {Math.floor(
                                                            pkg.discount_half_yearly ??
                                                                0
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        Rs{" "}
                                                        {Math.floor(
                                                            pkg.discount_yearly
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {pkg.months} Months
                                                    </TableCell>
                                                    <TableCell>
                                                        {(() => {
                                                            const accessControlIds =
                                                                typeof pkg.access_control_ids ===
                                                                "string"
                                                                    ? JSON.parse(
                                                                          pkg.access_control_ids
                                                                      )
                                                                    : pkg.access_control_ids;

                                                            return accessControlIds?.length
                                                                ? accessControlIds
                                                                      .map(
                                                                          (
                                                                              id: number
                                                                          ) => {
                                                                              const control =
                                                                                  accessControls.find(
                                                                                      (
                                                                                          ac
                                                                                      ) =>
                                                                                          ac.id ===
                                                                                          id
                                                                                  );
                                                                              return control
                                                                                  ? control.name
                                                                                  : "Unknown";
                                                                          }
                                                                      )
                                                                      .join(
                                                                          ", "
                                                                      )
                                                                : "No Access Controls";
                                                        })()}
                                                    </TableCell>

                                                    <TableCell>
                                                        <EditPackageDialog
                                                            pkg={pkg}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Access Controls Tab */}
                    <TabsContent value="access-controls">
                        <Card className="w-full bg-background shadow-lg rounded-lg">
                            <CardHeader className="border-b border-border p-4">
                                <div className="flex justify-between flex-wrap">
                                    <CardTitle className="text-xl font-semibold">
                                        Access Controls
                                    </CardTitle>
                                    <AddAccessControlDialog />
                                </div>
                                <CardDescription className="text-muted-foreground">
                                    Manage access controls for gym packages and
                                    services.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 overflow-y-auto">
                                <div className="space-y-4">
                                    {accessControls.map((control) => (
                                        <motion.div
                                            key={control.id}
                                            className="p-4 rounded-md border border-border bg-muted"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="flex justify-between">
                                                <h3 className="text-lg font-bold mb-2">
                                                    {control.name}
                                                </h3>
                                                <div className="flex items-center">
                                                    <EditAccessControlDialog
                                                        control={control}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1 text-sm text-foreground">
                                                <p>
                                                    <span className="font-medium">
                                                        System Type:
                                                    </span>{" "}
                                                    {control.type === "isup"
                                                        ? "ISUP"
                                                        : "Public URL"}
                                                </p>
                                                <p>
                                                    <span className="font-medium">
                                                        IP Address:
                                                    </span>{" "}
                                                    {control.ip_address}
                                                </p>
                                                <p>
                                                    <span className="font-medium">
                                                        Username:
                                                    </span>{" "}
                                                    {control.username}
                                                </p>
                                                <p>
                                                    <span className="font-medium">
                                                        Port:
                                                    </span>{" "}
                                                    {control.port}
                                                </p>
                                                <p>
                                                    <span className="font-medium">
                                                        Description:
                                                    </span>{" "}
                                                    {control.description}
                                                </p>
                                                <p>
                                                    <span className="font-medium">
                                                        UUID:
                                                    </span>{" "}
                                                    {control.uuid}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </Authenticated>
    );
};

// Collapsible Card Component for Packages with Animations
const CollapsibleCard = ({ package: pkg, accessControls }: any) => {
    const [isOpen, setIsOpen] = useState(false);

    const getAccessControlNames = (ids: number[]) => {
        return ids
            ?.map((id) => {
                const control = accessControls.find(
                    (ac: AccessControl) => ac.id === id
                );
                return control ? control.name : "N/A";
            })
            .join(", ");
    };

    return (
        <motion.div
            layout
            className="border border-border rounded-lg overflow-hidden bg-muted"
            initial={{ borderRadius: "12px" }}
            animate={{ borderRadius: isOpen ? "12px" : "12px" }}
        >
            <div
                className="p-4 cursor-pointer flex justify-between items-center hover:bg-accent/10 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3 className="text-lg font-bold text-primary">
                    {pkg.package_name}
                </h3>
                <button className="text-sm text-muted-foreground">
                    {isOpen ? "Collapse" : "Expand"}
                </button>
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 space-y-2"
                    >
                        <p>
                            <span className="font-medium">Admission Fee:</span>{" "}
                            {pkg.admission_amount} NPR
                        </p>
                        <p>
                            <span className="font-medium">Monthly Fee:</span>{" "}
                            {pkg.monthly_amount} NPR
                        </p>
                        <p>
                            <span className="font-medium">
                                Quarterly Discount:
                            </span>{" "}
                            {pkg.discount_quarterly} NPR
                        </p>
                        <p>
                            <span className="font-medium">
                                Half-Yearly Discount:
                            </span>{" "}
                            {pkg.discount_half_yearly} NPR
                        </p>
                        <p>
                            <span className="font-medium">
                                Yearly Discount:
                            </span>{" "}
                            {pkg.discount_yearly} NPR
                        </p>
                        <p>
                            <span className="font-medium">
                                Access Controls:
                            </span>{" "}
                            {pkg?.access_control_ids?.length > 0
                                ? getAccessControlNames(pkg.access_control_ids)
                                : "None"}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Index;
