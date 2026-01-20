"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Edit, Mail, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ClientActionsProps {
  customerId: string;
  customerEmail: string;
}

export default function ClientActions({ customerId, customerEmail }: ClientActionsProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.')) return;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)
        .select('id');

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No se pudo eliminar el cliente (permisos insuficientes o el registro ya no existe).');
      }
      
      router.refresh();
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert(error instanceof Error ? error.message : 'Error al eliminar el cliente');
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Link 
        href={`/administrator/clientes/${customerId}`} 
        className="p-2 text-gray-400 hover:text-furgocasa-orange hover:bg-furgocasa-orange/10 rounded-lg transition-colors" 
        title="Ver detalles"
      >
        <Eye className="h-5 w-5" />
      </Link>
      <Link 
        href={`/administrator/clientes/${customerId}/editar`} 
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" 
        title="Editar"
      >
        <Edit className="h-5 w-5" />
      </Link>
      <a 
        href={`mailto:${customerEmail}`} 
        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
        title="Enviar email"
      >
        <Mail className="h-5 w-5" />
      </a>
      <button 
        onClick={handleDelete}
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
        title="Eliminar"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
}

