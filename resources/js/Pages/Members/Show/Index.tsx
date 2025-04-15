import Authenticated from '@/Layouts/AuthenticatedLayout'
import { PageProps } from '@/types'
import { Member } from '@/types/members'
import React from 'react'

const Index = ({ auth, member }: PageProps<{ member: Member }>) => {
    return (
        <Authenticated user={auth.user}>
            {
                JSON.stringify(member)
            }
        </Authenticated>
    )
}

export default Index