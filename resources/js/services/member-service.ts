import { Member } from '@/types/members';
import axios, { AxiosResponse } from 'axios';
import moment from 'moment';

// Define the function to approve a member
export const approveMember = async (memberId: number): Promise<void> => {
  try {
    await axios.post(`/members/${memberId}/approve`);
  } catch (error) {
    console.error('Error approving member:', error);
    throw error;
  }
};

// Define the function to delete a member
export const deleteMember = async (memberId: number): Promise<void> => {
  try {
    await axios.post(`/members/${memberId}/delete`);
  } catch (error) {
    console.error('Error deleting member:', error);
    throw error;
  }
};

// Define the function to get the subscription status
export const getSubscriptionStatus = (member: Member): { variant: 'default' | 'destructive' | 'outline' | 'secondary' | null | undefined, text: string, className?: string } => {
  const today = new Date();
  if (member.is_approved) {
    if (new Date(member.payment_expiry_date as Date) <= today) {
      return { variant: 'destructive', text: 'Expired' };
    } else {
      return { variant: 'default', text: 'Active', className: 'border-green-500 hover:bg-green-500 bg-green-600 text-white' };
    }
  } else {
    return { variant: null, text: 'Unapproved', className: 'border-orange-500 hover:bg-orange-500 bg-orange-600 text-white' };
  }
};

// Define the function to format dates
export const formatDate = (date: Date): string => {
  return moment(date).format('MMM Do YYYY');
};