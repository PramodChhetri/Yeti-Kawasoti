import { Button } from '@/Components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/Components/ui/select'
import SingleImageUploader from '@/Components/ui/SingleImageUploader'
import { toast } from '@/Components/ui/use-toast'
import { capitalizeWords, cn } from '@/lib/utils'
import { useForm } from '@inertiajs/react'
import axios from 'axios'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import moment from 'moment'
import React, { FormEvent, useState } from 'react'

const CreateDialog = ({ refetch }: any) => {
    const { data, setData, reset } = useForm({
        name: '',
        phone: '',
        photo: null as unknown as File,
        gender: 'male',
        joining_date: new Date(),
        position: "",
        is_active: 1
    })

    const [processing, setProcessing] = useState(false);
    const [open, setOpen] = useState(false);

    const submit = (e: FormEvent) => {
        e.preventDefault()
        console.log(data);

        setProcessing(true);

        axios.post("/staffs", data, {
            headers: {
                "Content-Type": 'multipart/form-data'
            }
        }).then(response => {
            toast({
                description: "Staff Created successfully"
            });
            reset();
            refetch();
            setOpen(false);
        }).catch(error => {
            toast({
                description: "Failed to create staff"
            })
        }).finally(() => {
            setProcessing(false);
        });
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Button onClick={() => setOpen(true)}>Add New</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New</DialogTitle>
                    <DialogDescription>
                        Add new staff member
                    </DialogDescription>
                </DialogHeader>
                <form className='space-y-2' onSubmit={submit}>
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            type="text"
                            id="name"
                            value={data.name}
                            placeholder='Enter the name of the new staff member'
                            onChange={e => setData('name', capitalizeWords(e.target.value))}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <div className='grow'>
                            <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    type="tel"
                                    id="phone"
                                    value={data.phone}
                                    placeholder="Enter Staff's Phone"
                                    onChange={e => setData('phone', e.target.value)}
                                    maxLength={10}
                            minLength={10}
                                />
                            </div>
                            <div>
                                <Label htmlFor="gender">Gender</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a Gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <SingleImageUploader onImageUpload={file => setData('photo', file)} className='grow min-h-32' />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <div className='grow'>
                            <Label htmlFor='position'>Position</Label>
                            <Select onValueChange={val => setData('position', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a Position" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="Owner">Owner</SelectItem>
                                        <SelectItem value="Manager">Manager</SelectItem>
                                        <SelectItem value="Trainer">Trainer</SelectItem>
                                        <SelectItem value="Reception">Reception</SelectItem>
                                        <SelectItem value="Guard">Guard</SelectItem>
                                        <SelectItem value="House-Keeping">House Keeping</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='grow'>
                            <Label htmlFor='expiryDate'>Joining Date</Label>
                            <Input type='date' onChange={e => setData('joining_date', moment(e.target.value).format() as unknown as Date)} />
                        </div>
                    </div>
                    <div>
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default CreateDialog