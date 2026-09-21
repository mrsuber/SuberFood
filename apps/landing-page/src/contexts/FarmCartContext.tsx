'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CartItem {
  productId: string
  productSlug: string
  name: string
  image: string | null
  priceType: 'retail' | 'bulk'
  price: number
  unit: string
  quantity: number
  stockQuantity: number
  stockUnit: string
}

interface CartContextType {
  items: CartItem[]
  itemCount: number
  totalAmount: number
  addItem: (item: CartItem) => void
  removeItem: (productId: string, priceType: 'retail' | 'bulk') => void
  updateQuantity: (productId: string, priceType: 'retail' | 'bulk', quantity: number) => void
  clearCart: () => void
  isInCart: (productId: string, priceType: 'retail' | 'bulk') => boolean
  getCartItem: (productId: string, priceType: 'retail' | 'bulk') => CartItem | undefined
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'suberfood_farm_cart'

export function FarmCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart:', error)
      }
    }
    setMounted(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, mounted])

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const getCartKey = (productId: string, priceType: 'retail' | 'bulk') => {
    return `${productId}-${priceType}`
  }

  const isInCart = (productId: string, priceType: 'retail' | 'bulk') => {
    return items.some(
      (item) => item.productId === productId && item.priceType === priceType
    )
  }

  const getCartItem = (productId: string, priceType: 'retail' | 'bulk') => {
    return items.find(
      (item) => item.productId === productId && item.priceType === priceType
    )
  }

  const addItem = (newItem: CartItem) => {
    setItems((currentItems) => {
      const existingItemIndex = currentItems.findIndex(
        (item) =>
          item.productId === newItem.productId && item.priceType === newItem.priceType
      )

      if (existingItemIndex > -1) {
        // Update quantity if item already exists
        const updatedItems = [...currentItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
        }
        return updatedItems
      }

      // Add new item
      return [...currentItems, newItem]
    })
  }

  const removeItem = (productId: string, priceType: 'retail' | 'bulk') => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) => !(item.productId === productId && item.priceType === priceType)
      )
    )
  }

  const updateQuantity = (
    productId: string,
    priceType: 'retail' | 'bulk',
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeItem(productId, priceType)
      return
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId && item.priceType === priceType
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalAmount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
        getCartItem,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useFarmCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useFarmCart must be used within a FarmCartProvider')
  }
  return context
}
