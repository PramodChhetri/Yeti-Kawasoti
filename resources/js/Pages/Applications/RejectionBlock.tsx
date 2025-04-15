import { Button } from '@/Components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog'
import { toast } from '@/Components/ui/use-toast'
import { router } from '@inertiajs/react'
import { XCircle } from 'lucide-react'
import React from 'react'

const RejectionBlock = ({ rejectionType, applicationId }: { rejectionType: 'admission' | 'renewal', applicationId: string | number }) => {

    return (
        <Dialog>
            <DialogTrigger>
                <Button variant={'ghost'} size={'icon'}>
                    <XCircle className='text-destructive' />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Are You Sure To Delete This <span className="capitalize">{rejectionType}</span>
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undo, but applicants can resubmit the {rejectionType} form.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose>
                        <Button variant='secondary'>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button variant={'destructive'} onClick={() => router.get(`/reject/${rejectionType}/${applicationId}`, {}, {
                        onSuccess: () => {
                            toast({ description: <span className={'capitalize'}>{rejectionType} rejected successfully...</span> });
                        }
                    })}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default RejectionBlock