'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SliderProps extends Omit<React.ComponentProps<'input'>, 'type' | 'onChange' | 'value'> {
  min: number
  max: number
  value: number
  onValueChange: (value: number) => void
}

function Slider({ className, min, max, value, onValueChange, onPointerUp, ...props }: SliderProps) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onValueChange(Number(e.target.value))}
      onPointerUp={onPointerUp}
      className={cn(
        'w-full h-2 cursor-pointer appearance-none rounded-full bg-neutral-200 dark:bg-neutral-700 accent-violet-600 dark:accent-violet-500',
        className
      )}
      {...props}
    />
  )
}

export { Slider }
