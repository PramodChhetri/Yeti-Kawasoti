import * as React from "react";
import { DoorOpen as DoorOpenIcon } from "lucide-react";
import axios from "axios";

import { Button } from "@/Components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu";
import { toast } from "./ui/use-toast";

interface Device {
  id: string;
  name: string;
  ip_address: string;
  username: string;
  password: string;
  port: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export default function DoorOpen() {
  const [devices, setDevices] = React.useState<Device[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const handleDoorOpen = async (id: string) => {
    try {
      const response = await axios.get(`/open-door/${id}`);
      toast({ title: "Success", description: "Device door opened successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to open the door. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchAccessControl = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`/get-all-devices`);
      console.log(response.data);
      setDevices(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch devices.");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAccessControl();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="rounded-full bg-transparent hover:bg-transparent border-none text-card-foreground focus-visible:ring-0 focus-visible:outline-none"
          size="icon"
        >
          <DoorOpenIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isLoading ? (
          <DropdownMenuItem>Loading devices...</DropdownMenuItem>
        ) : error ? (
          <DropdownMenuItem>{error}</DropdownMenuItem>
        ) : devices.length > 0 ? (
          devices.map((device) => (
            <DropdownMenuItem
              key={device.id}
              onClick={() => handleDoorOpen(device.id)}
            >
              Open {device.name}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem>No devices found</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
