'use client'
import React from 'react'
import axios from 'axios';
import { FcGoogle } from 'react-icons/fc';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Field,
    FieldValues,
    SubmitHandler,
    useForm
} from 'react-hook-form';
import useRegisterModel from '@/app/hooks/useRegisterModel';
import Model from './model';
import Heading from '../heading';
import Input from '../Inputs/input';
import toast from 'react-hot-toast';
import Button from '../button';
import { signIn } from 'next-auth/react';
import useLoginModel from '@/app/hooks/useLoginModel';


const RegisterModel = () => {
  const router = useRouter();
  const registerModel = useRegisterModel();
  const loginModel = useLoginModel();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: {
        errors,
    }
  } = useForm<FieldValues>({
    defaultValues: {
        name: '',
        email: '',
        password: ''
    }
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);

    try {
        const res = await axios.post('/api/register', data);
        if (res.status === 200) {
            // Auto-login after successful registration
            const signInResponse = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false, // Prevent full-page reload
                callbackUrl: "/dashboard", // Redirect after login
            });

            if (signInResponse?.error) {
                toast.error("Auto-login failed. Please log in manually.");
            } else {
                toast.success("Logged in!");
                registerModel.onClose();
                loginModel.onClose();
                router.refresh();
            }
        } else {
            toast.error(res.data.error || "Registration failed");
        }
    } catch (error) {
        toast.error("Something went wrong");
    } finally {
        setIsLoading(false);
    }
  };



  const toggle = useCallback(() => {
    loginModel.onOpen();
    registerModel.onClose();
  }, [loginModel, registerModel])

  const bodyContent = (
    <div className='flex flex-col gap-4'>
      	<Heading 
          title='Welcome to Tradies'
          subtitle='Create an account!'
        />
        <Input 
          id='email'
          label='Email'
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
        <Input 
          id='name'
          label='Name'
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
        <Input 
          id='password'
          type='password'
          label='Password'
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
    </div>
  );

  const footerContent = (
    <div className='flex flex-col gap-4 mt-3'>
      <hr />
      <Button 
        outline
        label='Continue with Google'
        icon={FcGoogle}
        onClick={() => signIn('google')}
      />
      <div className='text-neutral-500 text-center mt-4 font-light'>
        <div className='justify-center flex flex-row items-center gap-2'>
          <div>Already have an account?</div>
          <div onClick={toggle} className='text-neutral-800 cursor-pointer hover:underline'>Log in</div>
        </div>
      </div>
    </div>
  )

  return (
    <Model 
      disabled={isLoading}
      isOpen={registerModel.isOpen}
      title='Register'
      actionLabel='Continue'
      onClose={registerModel.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
      footer={footerContent}
    />
  )
}

export default RegisterModel