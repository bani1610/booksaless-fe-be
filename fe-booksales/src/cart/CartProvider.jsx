import { useCallback, useEffect, useMemo, useState } from 'react'
import { ROLES } from '../auth/authService.js'
import { useAuth } from '../auth/useAuth.js'
import { CartContext } from './CartContext.js'

// Keranjang disimpan per akun di localStorage, jadi tidak tercampur antar pengguna
// dan tetap ada setelah halaman dimuat ulang. Stok dan harga tetap dicek ulang oleh API saat checkout.
function storageKey(user) {
  return user ? `cart:${user.id}` : null
}

function readCart(key) {
  if (!key) return []
  try {
    const items = JSON.parse(localStorage.getItem(key))
    return Array.isArray(items) ? items : []
  } catch {
    return []
  }
}

function CartProvider({ children }) {
  const { user, role } = useAuth()
  // Hanya customer yang boleh membuat transaksi (CustomerMiddleware), admin tidak punya keranjang
  const key = role === ROLES.USER ? storageKey(user) : null
  const [cart, setCart] = useState(() => ({ key, items: readCart(key) }))

  // Akun berganti (login/logout): muat keranjang milik akun tersebut saat render
  let items = cart.items
  if (cart.key !== key) {
    items = readCart(key)
    setCart({ key, items })
  }

  useEffect(() => {
    if (cart.key) localStorage.setItem(cart.key, JSON.stringify(cart.items))
  }, [cart])

  const update = useCallback((fn) => setCart((c) => ({ ...c, items: fn(c.items) })), [])

  // Simpan data buku seperlunya agar halaman keranjang bisa tampil tanpa request tambahan
  const addItem = useCallback(
    (book) =>
      update((list) => {
        const found = list.find((i) => i.id === book.id)
        if (found) {
          return list.map((i) =>
            i.id === book.id ? { ...i, quantity: Math.min(i.quantity + 1, book.stock) } : i,
          )
        }
        const { id, title, price, stock, cover_photo, genre_id, author } = book
        return [...list, { id, title, price, stock, cover_photo, genre_id, author, quantity: 1 }]
      }),
    [update],
  )

  const setQuantity = useCallback(
    (id, quantity) =>
      update((list) =>
        list.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i)),
      ),
    [update],
  )

  const removeItem = useCallback((id) => update((list) => list.filter((i) => i.id !== id)), [update])
  const clear = useCallback(() => update(() => []), [update])

  const value = useMemo(
    () => ({
      enabled: Boolean(key),
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      total: items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0),
      quantityOf: (id) => items.find((i) => i.id === id)?.quantity ?? 0,
      addItem,
      setQuantity,
      removeItem,
      clear,
    }),
    [key, items, addItem, setQuantity, removeItem, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export default CartProvider
