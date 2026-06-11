'use client'

import React, { useState, useTransition } from 'react'
import { signIn, signUp } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Shield, Mail, Lock, Loader2, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      if (isLogin) {
        const result = await signIn(formData)
        if (result?.error) {
          setError(result.error)
        }
      } else {
        const result = await signUp(formData)
        if (result?.error) {
          setError(result.error)
        } else if (result?.success) {
          setSuccess(result.success)
          setIsLogin(true) // Cambiar a login
        }
      }
    })
  }

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans flex items-center justify-center p-6">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-pulse delay-700"></div>

      <div className="relative w-full max-w-md z-10">
        {/* Card Container */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl transition-all duration-300">
          
          {/* Logo / Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 mb-4 shadow-sm">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {isLogin ? 'Acceso Administrador' : 'Crear Cuenta'}
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              {isLogin
                ? 'Ingresa tus credenciales para gestionar tus vCards'
                : 'Registra un nuevo usuario administrador'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Correo Electrónico
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@ejemplo.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-2xl text-xs flex items-start leading-relaxed">
                <span>⚠️ {error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl text-xs flex items-start leading-relaxed">
                <span>✅ {success}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(79,70,229,0.3)] transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isLogin ? 'Iniciando sesión...' : 'Registrando...'}
                </>
              ) : (
                <>
                  {isLogin ? 'Entrar al Panel' : 'Registrar Cuenta'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError(null)
                setSuccess(null)
              }}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors focus:outline-none cursor-pointer"
            >
              {isLogin
                ? '¿No tienes cuenta? Registra un usuario administrador'
                : '¿Ya tienes una cuenta? Inicia sesión aquí'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
