// contexts/DataContext.tsx
'use client'
import { DeliveryAgent, Order, Restaurant, User } from '@/components/admin/types'
import { useSession } from 'next-auth/react'
import { createContext, useContext, useState, useEffect } from 'react'

interface DataContextType {
  orders: Order[]
  restaurants: Restaurant[]
  deliveryAgents: DeliveryAgent[]
  users: User[]
  searchTerm: string
  setSearchTerm: (term: string) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [deliveryAgents, setDeliveryAgents] = useState<DeliveryAgent[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const {data:session} = useSession()
  const fetchRestaurants = async () => {
   
    try {
      const response = await fetch('/api/restaurants',{
        headers:{
          Authorization: `Bearer ${session?.user.accessToken}`,

        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch restaurants')
      }
      const data = await response.json()
      setRestaurants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err)
    } 
  }

   // Fetch orders from the API
   const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders',{
        headers:{
          Authorization: `Bearer ${session?.user.accessToken}`,

        }
      }) // Adjust the API endpoint as needed
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
  
    }
  }
  const fetchDeliveryAgents = async () => {
    try {
        const response = await fetch('/api/agents',{
          headers:{
            Authorization: `Bearer ${session?.user.accessToken}`,

          }
        });
        if (!response.ok) throw new Error('Failed to fetch delivery agents');
        const data = await response.json();
        // Ensure that the data is an array before setting it
        if (Array.isArray(data.agents)) {
          setDeliveryAgents(data.agents);
      
        } else {
          
            throw new Error('Expected an array of delivery agents');
        }
    } catch (error) {
        console.error(error);

    }
};
  useEffect(() => {
    fetchRestaurants()
    fetchOrders()
    fetchDeliveryAgents()
  }, [])
 

  return (
    <DataContext.Provider value={{ 
      orders, 
      restaurants, 
      deliveryAgents, 
      users, 
      searchTerm, 
      setSearchTerm 
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}