'use client';

import React from 'react';
import Select from 'react-select';
import { FieldErrors, FieldValues, UseFormRegister, Controller } from 'react-hook-form';

interface InputProps {
  id: string;
  label: string;
  disabled?: boolean;
  required?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  options?: string[];
  control: any; // Required for react-hook-form's Controller
}

const SearchInput: React.FC<InputProps> = ({
  id,
  label,
  disabled,
  register,
  required,
  errors,
  options,
  control
}) => {
  return (
    <div className="w-full relative">
      <label className="block text-md font-medium text-gray-700 mb-2">{label}</label>

      {/* Use react-select if options are provided */}
      {options ? (
        <Controller
          name={id}
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              value={options ? options.map((option) => ({ value: option, label: option })).find(option => option.value === field.value) : null}
              options={options.map((option) => ({ value: option, label: option }))}
              isDisabled={disabled}
              classNamePrefix="react-select"
              onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : null)}
              styles={{
                control: (provided) => ({
                  ...provided,
                  padding: '6px',
                  borderColor: errors[id] ? '#f87171' : '#d1d5db',
                  boxShadow: 'none',
                  '&:hover': { borderColor: errors[id] ? '#f87171' : '#6b7280' },
                }),
                menu: (provided) => ({
                  ...provided,
                  maxHeight: '200px', // Restrict dropdown height
                  overflowY: 'auto', // Enable scrolling inside dropdown only
                  zIndex: 9999, // Ensure dropdown appears on top
                }),
                menuList: (provided) => ({
                  ...provided,
                  maxHeight: '200px', // Ensures only dropdown scrolls, no extra scrollbar
                  overflowY: 'auto',
                  scrollbarWidth: 'thin', // Makes scrollbar less intrusive
                }),
              }}
            />
          )}
        />
      ) : (
        <input
          id={id}
          disabled={disabled}
          {...register(id, { required })}
          className={`peer w-full p-4 font-light bg-white border-2 rounded-md outline-none transition disabled:opacity-70
            disabled:cursor-not-allowed ${errors[id] ? 'border-rose-500' : 'border-neutral-300'}
            ${errors[id] ? 'focus:border-rose-500' : 'focus:border-black'}`}
        />
      )}
    </div>
  );
};

export default SearchInput;
