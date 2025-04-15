import { DoorOpen } from 'lucide-react';
import { toast } from '@/Components/ui/use-toast';
import axios from 'axios';
import { useState } from 'react';

const OpenDoor = ({ accessControlId }: { accessControlId: any }) => {
  const [isLoading, setIsLoading] = useState(false); // Track loading state

  const handleClick = async (id: any) => {
    if (!id) {
      return;
    }

    setIsLoading(true); 
    try {
      const response = await axios.get(`/open-door/${id}`);
      toast({ title: 'Success', description: 'Device door opened successfully' });
    } catch (error: any) {
        error.response?.data?.error || 'Failed to open the door. Please try again.';
      toast({ title: 'Error', description: 'Failed to open the door for device!!', variant: 'destructive' });
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <button
      className={`text-sm me-1 text-muted-foreground flex gap-1 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => handleClick(accessControlId)}
      disabled={isLoading} 
    >
      <DoorOpen size={15} />
      {isLoading && <span>Opening...</span>}
    </button>
  );
};

export default OpenDoor;
