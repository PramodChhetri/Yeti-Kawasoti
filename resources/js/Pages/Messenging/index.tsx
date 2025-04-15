import InputError from '@/Components/InputError';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { MembershipPackage, PageProps } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import FilterPopover from './FilterPopover';

const index = ({ auth, sms_balance, packages, contacts }: PageProps<{ sms_balance: number, packages: MembershipPackage[], contacts: string[] }>) => {
  const { data, setData, errors, post, processing } = useForm({
    contacts: contacts || [],
    message: '',
  });

  const [totalPages, setTotalPages] = useState(1);
  const [totalDisplayCharacters, setTotalDisplayCharacters] = useState(160);

  const handleMessageChange = (message: string) => {
    const totalCharacters = message.length;
    const totalPages = Math.max(Math.ceil(totalCharacters / 160), 1);
    setTotalPages(totalPages);
    setTotalDisplayCharacters(totalPages * 160);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Validate data before submission
    if (!data.contacts.length || !data.message.trim()) {
      console.error('Contacts and Message are required');
      return;
    }

    // Proceed with submission
    post('/send-message', {
      onSuccess: () => {
        // Clear the form fields upon successful submission
        setData({ contacts: [], message: '' });
        setTotalPages(1); // Reset total pages
        setTotalDisplayCharacters(160); // Reset display characters
      },
    });
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <header className="flex justify-between">
        <h1 className="text-xl font-semibold">Send Message</h1>
        {sms_balance < 0 ? (
          <span className="text-muted-foreground">SMS service unavailable</span>
        ) : (
          <span className="text-card-foreground">Balance: Rs {sms_balance}</span>
        )}
      </header>
      <div className="ms-auto">
        <FilterPopover packages={packages} />
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="contacts">Contacts</Label>
          <Textarea
            id="contacts"
            required
            value={data.contacts.length > 0 ? data.contacts.join(', ') : ''} // Properly handle cleared state
            onChange={(e) =>
              setData('contacts', e.target.value ? e.target.value.split(',').map((c) => c.trim()) : [])
            } // Handle empty case
            placeholder="Comma Separated contact numbers"
          />
          <InputError message={errors.contacts} />
        </div>
        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            required
            value={data.message}
            onChange={(e) => {
              setData('message', e.target.value);
              handleMessageChange(e.target.value);
            }}
            placeholder="Enter message to the members"
          />
          <InputError message={errors.message} />
          <div className="text-muted-foreground mt-2 flex justify-between">
            <span>
              Total Pages: {totalPages} - (Rs {(totalPages * data.contacts.length * 1.4).toFixed(2)})
            </span>
            <span>
              {data.message.length} / {totalDisplayCharacters}
            </span>
          </div>
        </div>
        <Button type="submit" disabled={sms_balance <= 0}>
          Send SMS Alert
        </Button>
      </form>
    </AuthenticatedLayout>
  );
};

export default index;
