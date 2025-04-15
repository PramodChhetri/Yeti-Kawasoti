import ApplicationLogo from '@/Components/ApplicationLogo';
import { Card } from '@/Components/ui/card';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import GlobalLayout from './GlobalLayout';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <GlobalLayout>
            <Card className="flex h-screen overflow-auto flex-col sm:justify-center items-center pt-6 sm:pt-0">
                {/* <div>
                    <Link href="/">
                        <ApplicationLogo className="w-20 h-20 fill-current" />
                    </Link>
                </div> */}
                {children}
            </Card>
        </GlobalLayout>
    );
}
