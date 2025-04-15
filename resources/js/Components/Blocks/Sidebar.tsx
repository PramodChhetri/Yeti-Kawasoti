import { Banknote, Gauge, Menu, MessageCircle, Package2, RefreshCcwDotIcon, Settings, TimerIcon, Users } from 'lucide-react';
import { Card } from '../ui/card';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { Link, usePage } from '@inertiajs/react';

const navItems = [
    { icon: Gauge, text: "Dashboard", href: "/dashboard" },
    { icon: Users, text: "Members", href: "/members" },
    { icon: RefreshCcwDotIcon, text: "Requests", href: "/application-requests" },
    { icon: Users, text: "Officials", href: "/staffs" },
    { icon: MessageCircle, text: "Messaging", href: "/messenging" },
    { icon: TimerIcon, text: "Events", href: "/events" }, 
    { icon: Banknote, text: "Transactions", href: "/transactions" },
    { icon: Settings, text: "Settings", href: "/settings" },
];

export const DesktopBar = () => {
    const { url } = usePage(); // Get current page information
    const path = url; // Extract path from URL

    const { props } = usePage() as { props: { env: { gymName: string } } };

    return (
        <Card className="hidden bg-card md:block rounded-none border-0 border-e">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center justify-between gap-4 border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center">
                        <span className='font-bold drop-shadow-md capitalize text-sm'>{props.env.gymName}</span>
                    </Link>
                </div>
                <div className="flex-1">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                        {navItems.map((item, index) => (
                            <Link key={index} href={item.href} className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all ${path.startsWith(item.href) ? `bg-primary text-primary-foreground` : `hover:bg-muted`}`}>
                                <item.icon className={`h-4 w-4 ${path.startsWith(item.href) && ""}`} />
                                {item.text}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </Card>
    )
}

export const MobileBar = () => {
    const { url: path } = usePage(); // Get current page information
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
                <nav className="grid gap-2 text-lg font-medium">
                    <Link href="#" className="flex items-center gap-2 text-lg font-semibold">
                        <Package2 className="h-6 w-6" />
                        <span className="sr-only">Acme Inc</span>
                    </Link>
                    {navItems.map((item, index) => (
                        <Link key={index} href={item.href} className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground">
                            <item.icon className="h-5 w-5" />
                            {item.text}
                        </Link>
                    ))}
                </nav>
            </SheetContent>
        </Sheet>
    );
}

export const AdminTitle = () => {
    const { url: path } = usePage(); // Get current page information
    return (
        <h2 className="w-full flex-1 font-semibold text-xl text-card-foreground">
            {
                navItems.find(item => path.startsWith(item.href))?.text
            }
        </h2>
    );
}