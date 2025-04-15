import { useState, PropsWithChildren, ReactNode, useEffect } from "react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link } from "@inertiajs/react";
import { User } from "@/types";
import GlobalLayout from "./GlobalLayout";
import { Card } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { AdminTitle, DesktopBar, MobileBar } from "@/Components/Blocks/Sidebar";
import ThemeToggle from "@/Components/ThemeToggle";
import ToggleUserMenu from "@/Components/ToggleUserMenu";
import DoorOpen from "@/Components/DoorOpen";

export default function Authenticated({
    user,
    header,
    children,
}: PropsWithChildren<{ user: User; header?: ReactNode }>) {
    return (
        <GlobalLayout>
            <Card className="grid h-screen w-full md:grid-cols-[200px_1fr] lg:grid-cols-[210px_1fr] overflow-hidden">
                <DesktopBar />
                <div className="flex flex-col h-full overflow-auto">
                    <header className="flex bg-card h-14 items-center gap-4 border-b p-4 lg:h-[60px] lg:px-6">
                        <MobileBar />
                        <AdminTitle />
                        <div className="flex gap-2">
                            <DoorOpen />
                            <ThemeToggle />
                            <ToggleUserMenu user={user} />
                        </div>
                    </header>
                    <main className="flex flex-1 flex-col flex-grow h-full overflow-auto gap-4 p-4 lg:gap-6 lg:p-6">
                        {children}
                    </main>
                </div>
            </Card>
        </GlobalLayout>
    );
}
