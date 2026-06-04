'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import InputField from './InputField'
import { useAuth } from '../../context/AuthContext'
import apiClient from '@/lib/apiClient'

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    setIsLoading(true)
    
    try {
      const response = await apiClient.post('/api/signup/', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      })
      const data = response.data
      
      if (data.status === 'success') {
        login(data.user, data.token)
        router.push('/dashboard')
      } else {
        let msg = 'Signup failed.'
        if (typeof data.message === 'string') {
          msg = data.message
        } else if (typeof data.message === 'object') {
          msg = Object.values(data.message).flat().join(' ')
        }
        setError(msg)
      }
    } catch (err: any) {
      if (!err.response && err.message === 'Network Error') {
        setError('Connection error. Please ensure the backend server is running.')
      } else {
        setError(err.response?.data?.message || 'Signup failed.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setError(null)
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== ''

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
      {/* Progress Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center space-x-2 mb-6"
      >
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              step <= Math.min(3, Math.floor((Object.values(formData).filter(v => v !== '').length / 4) * 3) + 1)
                ? 'bg-accent' 
                : 'bg-gray-300'
            }`}
          />
        ))}
      </motion.div>

      <InputField
        label="Full Name"
        type="text"
        value={formData.name}
        onChange={(value) => handleInputChange('name', value)}
        placeholder="Enter your full name"
        required
      />

      <InputField
        label="Email"
        type="email"
        value={formData.email}
        onChange={(value) => handleInputChange('email', value)}
        placeholder="Enter your email"
        required
      />

      <div className="space-y-4">
        <InputField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={(value) => handleInputChange('password', value)}
          placeholder="Create a strong password"
          required
          showPasswordToggle
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />

        {/* Password Strength Indicator */}
        {formData.password && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2"
          >
            <div className="flex space-x-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    level <= passwordStrength
                      ? level <= 2 ? 'bg-red-400' : level === 3 ? 'bg-yellow-400' : 'bg-green-400'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className={`text-xs ${
              passwordStrength <= 2 ? 'text-red-500' : 
              passwordStrength === 3 ? 'text-yellow-500' : 'text-green-500'
            }`}>
              {passwordStrength <= 2 ? 'Weak password' : 
               passwordStrength === 3 ? 'Good password' : 'Strong password'}
            </p>
          </motion.div>
        )}
      </div>

      <div className="space-y-2">
        <InputField
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={(value) => handleInputChange('confirmPassword', value)}
          placeholder="Confirm your password"
          required
          showPasswordToggle
          showPassword={showConfirmPassword}
          onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
        />

        {/* Password Match Indicator */}
        {formData.confirmPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex items-center space-x-2 text-xs ${
              passwordsMatch ? 'text-green-500' : 'text-red-500'
            }`}
          >
            <span>{passwordsMatch ? '✓' : '✗'}</span>
            <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-start space-x-2"
      >
        <input
          type="checkbox"
          required
          className="w-4 h-4 text-accent bg-gray-100 border-gray-300 rounded focus:ring-accent focus:ring-2 mt-0.5"
        />
        <span className="text-sm text-text/70 leading-relaxed">
          I agree to the{' '}
          <a href="#" className="text-accent hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-accent hover:underline">Privacy Policy</a>
        </span>
      </motion.div>

      <motion.button
        type="submit"
        disabled={isLoading || !passwordsMatch || passwordStrength < 2}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-gradient-to-r from-button to-accent text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden"
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
            <span>Creating Account...</span>
          </div>
        ) : (
          'Create Account'
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
          <span className="px-4 bg-white text-text/60">or sign up with</span>
        </div>
      </motion.div>

      {/* Google Sign Up */}
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