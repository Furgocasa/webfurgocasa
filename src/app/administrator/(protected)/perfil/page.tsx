"use client";

import { useState } from "react";
import { useAdminAuth } from "@/contexts/admin-auth-context";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Check,
  Loader2,
  Smartphone,
  Moon,
  Sun,
} from "lucide-react";

export default function PerfilPage() {
  const { admin } = useAdminAuth();
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!admin) return null;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden" });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "La contraseña debe tener al menos 6 caracteres" });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      setMessage({ type: "success", text: "Contraseña actualizada correctamente" });
      setChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error al actualizar la contraseña";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  const isPWA =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Mi perfil
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Información de tu cuenta de administrador
        </p>
      </div>

      {/* Info card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-furgocasa-orange to-orange-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {admin.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {admin.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {admin.role || "Administrador"}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
          <div className="flex items-center gap-4 px-6 py-4">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {admin.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-6 py-4">
            <Shield className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Rol</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                {admin.role || "admin"}
              </p>
            </div>
          </div>
          {admin.last_login && (
            <div className="flex items-center gap-4 px-6 py-4">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Último acceso</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {new Date(admin.last_login).toLocaleString("es-ES", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Europe/Madrid",
                  })}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-4 px-6 py-4">
            <Smartphone className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">App PWA</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {isPWA ? (
                  <span className="flex items-center gap-1.5 text-green-600">
                    <Check className="h-4 w-4" /> Instalada
                  </span>
                ) : (
                  "No instalada"
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-gray-400" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Contraseña
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Cambiar tu contraseña de acceso
              </p>
            </div>
          </div>
          {!changingPassword && (
            <button
              onClick={() => setChangingPassword(true)}
              className="text-sm font-medium text-furgocasa-orange hover:underline"
            >
              Cambiar
            </button>
          )}
        </div>

        {changingPassword && (
          <form onSubmit={handleChangePassword} className="border-t border-gray-100 dark:border-gray-700 p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                placeholder="Repite la contraseña"
                required
              />
            </div>

            {message && (
              <div
                className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                {message.type === "success" ? (
                  <Check className="h-4 w-4" />
                ) : null}
                {message.text}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-furgocasa-orange hover:bg-furgocasa-orange-dark text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Guardar
              </button>
              <button
                type="button"
                onClick={() => {
                  setChangingPassword(false);
                  setMessage(null);
                }}
                className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
