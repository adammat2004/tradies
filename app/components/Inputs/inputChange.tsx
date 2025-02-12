'use client'

import React from 'react'

interface ChangeInputProps {
  id: string;
  label: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputChange: React.FC<ChangeInputProps> = ({
id, label, type = 'text', disabled, required, value, onChange
}) => {
return (
  <div>
    <input 
        id={id}
        disabled={disabled}
        placeholder=' '
        type={type}
        value={value}
        onChange={onChange}
        className={`peer w-full p-4 pt-6 font-light bg-white border-2 rounded-md outline-none transition disabled:opacity-70
          disabled:cursor-not-allowed
          pl-4
          focus:border-black`}
    />
  </div>
)
}

export default InputChange