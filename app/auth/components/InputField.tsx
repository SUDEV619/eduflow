'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface InputFieldProps {
  label: string
  type: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  showPasswordToggle?: boolean
  showPassword?: boolean
  onTogglePassword?: () => void
}

export default function InputField({
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleBlur = () => {
    setIsFocused(false)
    if (required && !value) {
      setHasError(true)
    } else {
      setHasError(false)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    setHasError(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    if (hasError && e.target.value) {
      setHasError(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Floating Label */}
      <motion.label
        animate={{
          y: isFocused || value ? -24 : 0,
          scale: isFocused || value ? 0.85 : 1,
          color: hasError ? '#ef4444' : isFocused ? '#6FB7B4' : '#6b7280'
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute left-4 top-4 font-medium pointer-events-none origin-left z-10"
      >
        {label} {required && <span className="text-red-400">*</span>}
      </motion.label>

      <div className="relative">
        <motion.input
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isFocused ? placeholder : ''}
          className={`w-full px-4 py-4 bg-white/50 backdrop-blur-sm border-2 rounded-2xl transition-all duration-300 focus:outline-none ${
            hasError
              ? 'border-red-400 focus:border-red-500'
              : isFocused
              ? 'border-accent focus:border-accent shadow-lg shadow-accent/20'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          whileFocus={{ scale: 1.01 }}
        />

        {/* Password Toggle */}
        {showPasswordToggle && (
          <motion.button
            type="button"
            onClick={onTogglePassword}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-accent transition-colors duration-200"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </motion.button>
        )}

        {/* Focus Ring */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{
            boxShadow: isFocused 
              ? '0 0 0 3px rgba(111, 183, 180, 0.1)' 
              : '0 0 0 0px rgba(111, 183, 180, 0)'
          }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Error Message */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: hasError ? 1 : 0, 
          height: hasError ? 'auto' : 0 
        }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <p className="text-red-500 text-sm mt-2 ml-1">
          {label} is required
        </p>
      </motion.div>
    </motion.div>
  )
}