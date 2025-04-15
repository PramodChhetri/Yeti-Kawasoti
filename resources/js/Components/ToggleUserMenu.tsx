import React from 'react'
import { CircleUser, LogOut, User2 } from 'lucide-react'
import { Button } from './ui/button'
import { Link } from '@inertiajs/react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { PageProps, User } from '@/types'

const ToggleUserMenu = ({ user }: { user: User }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                    <CircleUser className="h-5 w-5" />
                    <span className="sr-only">Toggle user menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href='/profile'>
                    <DropdownMenuItem><User2 className='size-4 mr-2'/> Profile</DropdownMenuItem>
                </Link>
                <Link href={route('logout')}>
                    <DropdownMenuItem><LogOut className='size-4 mr-2'/> Logout</DropdownMenuItem>
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default ToggleUserMenu