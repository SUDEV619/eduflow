'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import InputField from './InputField'
import { useAuth } from '../../context/AuthContext'
import apiClient from '@/lib/apiClient'
export default function SignInForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { login } = useAuth()

  const validateForm = () => {
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!validateForm()) return

    setIsLoading(true)
    
    const submitData = {
      ...formData,
      email: formData.email.trim()
    }

    try {
      const response = await apiClient.post('/api/login/', submitData)
      const data = response.data
      
      if (data.status === 'success') {
        login(data.user, data.token)
        if (data.user?.role === 'ADMIN') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      } else {
        const errorMessage = typeof data.message === 'string' 
          ? data.message 
          : (typeof data.message === 'object' ? JSON.stringify(data.message) : null)
        setError(errorMessage || 'Login failed. Please check your credentials.')
      }
    } catch (err: any) {
      if (!err.response && err.message === 'Network Error') {
        setError('Connection error. Please ensure the backend server is running.')
      } else {
        const errorData = err.response?.data
        const errorMessage = typeof errorData?.message === 'string'
          ? errorData.message
          : (typeof errorData?.detail === 'string'
            ? errorData.detail
            : (typeof errorData?.message === 'object'
              ? JSON.stringify(errorData.message)
              : (errorData ? JSON.stringify(errorData) : null)))
        
        setError(errorMessage || 'Login failed. Please check your credentials.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setError(null)
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium"
        >
          {error}
        </motion.div>
      )}

      <InputField
        label="Email"
        type="email"
        value={formData.email}
        onChange={(value) => handleInputChange('email', value)}
        placeholder="Enter your email"
        required
      />

      <InputField
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={(value) => handleInputChange('password', value)}
        placeholder="Enter your password"
        required
        showPasswordToggle
        showPassword={showPassword}
        onTogglePassword={() => setShowPassword(!showPassword)}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between"
      >
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 text-accent bg-gray-100 border-gray-300 rounded focus:ring-accent focus:ring-2"
          />
          <span className="text-sm text-text/70">Remember me</span>
        </label>
        
        <a
          href="#"
          className="text-sm text-accent hover:text-accent/80 transition-colors duration-300"
        >
          Forgot password?
        </a>
      </motion.div>

      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-gradient-to-r from-button to-accent text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden"
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto"
          />
        ) : (
          'Sign In'
        )}
        
        {/* Button shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
      </motion.button>

      {/* Divider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative"
      >
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300/50" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-text/60">or continue with</span>
        </div>
      </motion.div>

      {/* Google Sign In */}
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-white border-2 border-gray-200 text-text rounded-2xl font-semibold flex items-center justify-center space-x-3 hover:border-accent/30 hover:shadow-lg transition-all duration-300"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>Continue with Google</span>
      </motion.button>
    </form>
  )
}