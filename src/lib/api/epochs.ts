
import { supabase } from '../supabaseClient';
import { toast } from '@/hooks/use-toast';

// Define the Epoch type based on your schema design
export interface Epoch {
  id?: string;
  user_id?: string; // Assuming you'll associate epochs with users
  title: string;
  startDate: string; // Consider using ISO date strings
  endDate: string; // Consider using ISO date strings
  themeFocus?: string;
  // Add other relevant fields like progress, status, etc.
  created_at?: string;
}

// Create a new epoch
export const createEpoch = async (epochData: Omit<Epoch, 'id' | 'user_id' | 'created_at'>): Promise<Epoch | null> => {
  console.log('Attempting to create epoch:', epochData);
  // const { data: { user } } = await supabase.auth.getUser(); // Get current user
  // if (!user) {
  //   toast({ title: "Error", description: "User not authenticated.", variant: "destructive" });
  //   return null;
  // }
  // const { data, error } = await supabase
  //   .from('epochs') // Your table name
  //   .insert([{ ...epochData, user_id: user.id }])
  //   .select()
  //   .single();

  // if (error) {
  //   console.error('Error creating epoch:', error);
  //   toast({ title: "API Error", description: `Failed to create epoch: ${error.message}`, variant: "destructive" });
  //   return null;
  // }
  // console.log('Epoch created successfully:', data);
  // return data;

  // Placeholder implementation:
  await new Promise(resolve => setTimeout(resolve, 1000));
  const mockEpoch: Epoch = { ...epochData, id: `epoch_${Date.now()}`, user_id: 'mock_user_id', created_at: new Date().toISOString(), title: epochData.title, startDate: epochData.startDate, endDate: epochData.endDate, themeFocus: epochData.themeFocus };
  toast({ title: "Epoch Created (Mock)", description: "Epoch data submitted (mock)." });
  return mockEpoch;
};

// Fetch epochs for the current user
export const fetchEpochs = async (userId: string): Promise<Epoch[]> => {
  console.log('Fetching epochs for user:', userId);
  // const { data, error } = await supabase
  //   .from('epochs')
  //   .select('*')
  //   .eq('user_id', userId) // Filter by user_id
  //   .order('startDate', { ascending: true });

  // if (error) {
  //   console.error('Error fetching epochs:', error);
  //   toast({ title: "API Error", description: `Failed to fetch epochs: ${error.message}`, variant: "destructive" });
  //   return [];
  // }
  // return data || [];
  
  // Placeholder implementation:
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { id: '1', user_id: userId, title: "Q2 Project Launch & Optimization", startDate: "2025-05-01", endDate: "2025-07-31", themeFocus: "Launch and Optimize", created_at: new Date().toISOString() },
    { id: '2', user_id: userId, title: "Summer Learning Sprint", startDate: "2025-08-01", endDate: "2025-08-31", themeFocus: "Deep Learning", created_at: new Date().toISOString() },
  ];
};

// Subscribe to epoch changes
export const subscribeToEpochChanges = (userId: string, callback: (payload: any) => void) => {
  console.log('Subscribing to epoch changes for user:', userId);
  // const channel = supabase
  //   .channel(`epochs_user_${userId}`)
  //   .on('postgres_changes', { event: '*', schema: 'public', table: 'epochs', filter: `user_id=eq.${userId}` }, callback)
  //   .subscribe((status, err) => {
  //     if (status === 'SUBSCRIBED') {
  //       console.log('Successfully subscribed to epoch changes!');
  //     }
  //     if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
  //       console.error('Subscription error/closed:', err || status);
  //     }
  //   });
  // return channel; // Return channel to allow unsubscription

  // Placeholder:
  const intervalId = setInterval(() => {
    // callback({ new: { id: 'mock_change', message: 'Epoch updated via mock subscription' } });
  }, 5000);
  return {
    unsubscribe: () => {
      clearInterval(intervalId);
      console.log("Unsubscribed from mock epoch changes.");
    }
  };
};

// Update an epoch
export const updateEpoch = async (epochId: string, updates: Partial<Epoch>): Promise<Epoch | null> => {
  console.log(`Updating epoch ${epochId} with:`, updates);
  // const { data, error } = await supabase
  //   .from('epochs')
  //   .update(updates)
  //   .eq('id', epochId)
  //   .select()
  //   .single();

  // if (error) {
  //   console.error('Error updating epoch:', error);
  //   toast({ title: "API Error", description: `Failed to update epoch: ${error.message}`, variant: "destructive" });
  //   return null;
  // }
  // console.log('Epoch updated successfully:', data);
  // return data;
  
  // Placeholder:
  await new Promise(resolve => setTimeout(resolve, 700));
  toast({ title: "Epoch Updated (Mock)", description: `Epoch ${epochId} updated.` });
  return { id: epochId, ...updates } as Epoch;
};

// Delete an epoch
export const deleteEpoch = async (epochId: string): Promise<boolean> => {
  console.log(`Deleting epoch ${epochId}`);
  // const { error } = await supabase
  //   .from('epochs')
  //   .delete()
  //   .eq('id', epochId);

  // if (error) {
  //   console.error('Error deleting epoch:', error);
  //   toast({ title: "API Error", description: `Failed to delete epoch: ${error.message}`, variant: "destructive" });
  //   return false;
  // }
  // console.log('Epoch deleted successfully');
  // return true;

  // Placeholder:
  await new Promise(resolve => setTimeout(resolve, 500));
  toast({ title: "Epoch Deleted (Mock)", description: `Epoch ${epochId} deleted.` });
  return true;
};

