"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

import type { Admin } from '@/types/blog';

interface AdminAuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ 
  children, 
  initialAdmin 
}: { 
  children: ReactNode;
  initialAdmin: Admin | null;
}) {
  const [admin, setAdmin] = useState<Admin | null>(initialAdmin);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  // ✅ OPTIMIZACIÓN: Solo verificar autenticación cada 5 minutos (no en cada navegación)
  useEffect(() => {
    // Si ya tenemos admin, no hacer nada inicialmente
    if (!initialAdmin) {
      // Solo verificar si no hay admin inicial
      refreshAuth();
    }

    // Verificación periódica en background (cada 5 minutos)
    const interval = setInterval(() => {
      refreshAuth();
    }, 5 * 60 * 1000); // 5 minutos

    // Listener para cambios de autenticación (logout, etc)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        setAdmin(null);
        router.push('/administrator/login');
      } else if (event === 'SIGNED_IN') {
        await refreshAuth();
      }
    });

    return () => {
      interval && clearInterval(interval);
      subscription?.unsubscribe();
    };
  }, []); // Solo ejecutar al montar

  const refreshAuth = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setAdmin(null);
        if (pathname?.startsWith('/administrator') && !pathname?.includes('/login')) {
          router.push('/administrator/login');
        }
        return;
      }

      // Verificar que el usuario es administrador
      const { data: adminData, error } = await supabase
        .from("admins")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      if (error || !adminData) {
        setAdmin(null);
        if (pathname?.startsWith('/administrator') && !pathname?.includes('/login')) {
          router.push('/administrator/login');
        }
        return;
      }

      setAdmin(adminData as Admin);
    } catch (error) {
      console.error('Error refreshing auth:', error);
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Cerrar sesión en Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error al cerrar sesión:', error);
        throw error;
      }
      
      // Limpiar estado local
      setAdmin(null);
      
      // Redirigir al login
      router.push('/administrator/login');
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
      // Aún así intentar limpiar y redirigir
      setAdmin(null);
      router.push('/administrator/login');
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminAuthContext.Provider 
      value={{ 
        admin, 
        isLoading, 
        isAuthenticated: !!admin,
        logout,
        refreshAuth 
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth debe ser usado dentro de un AdminAuthProvider');
  }
  return context;
}
