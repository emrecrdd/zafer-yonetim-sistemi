import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Sidebar = () => {
  const { user } = useAuth()

  console.log('👤 Sidebar User:', user) // Debug için
  console.log('🎯 User Role:', user?.role) // Debug için

  // Sidebar.jsx - navigation array'ini güncelle:

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
    roles: ['SUPER_ADMIN', 'IL_BASKANI', 'ILCE_BASKANI', 'GONULLU'] // ✅ BÜYÜK HARF
  },
  {
    name: 'Gönüllüler',
    href: '/users',
    icon: '👥',
    roles: ['SUPER_ADMIN', 'IL_BASKANI', 'ILCE_BASKANI'] // ✅ BÜYÜK HARF
  },
  {
    name: 'Etkinlikler',
    href: '/events',
    icon: '📅',
    roles: ['SUPER_ADMIN', 'IL_BASKANI', 'ILCE_BASKANI', 'GONULLU'] // ✅ BÜYÜK HARF
  },
  {
    name: 'Görevler',
    href: '/tasks',
    icon: '✅',
    roles: ['SUPER_ADMIN', 'IL_BASKANI', 'ILCE_BASKANI', 'GONULLU'] // ✅ BÜYÜK HARF
  },
];
  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  )

  console.log('📋 Filtered Navigation:', filteredNavigation) // Debug için

  return (
    <div className="w-64 bg-white shadow-sm border-r">
      <div className="flex flex-col h-full">
        {/* Logo */}
       <div className="flex items-center justify-center h-16 border-b bg-white shadow-sm">
  <div className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 transition-colors rounded-md cursor-pointer">
    
    {/* Logo Görseli */}
    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-600 shadow-md flex-shrink-0">
      <img 
        src="/vite.jpg"   // public klasöründen direkt path
        alt="Zafer Partisi Logo"
        className="w-full h-full object-cover"
      />
    </div>

    {/* Yazı */}
    <span className="font-bold text-gray-900 text-lg md:text-xl select-none">
      Zafer Partisi
    </span>
  </div>
</div>


        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-red-50 text-red-700 border-r-2 border-red-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info Debug */}
        <div className="p-4 border-t bg-gray-50">
          <div className="text-xs text-gray-600">
            <p>Kullanıcı: {user?.name}</p>
            <p>Rol: {user?.role}</p>
            <p>Menü Sayısı: {filteredNavigation.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
