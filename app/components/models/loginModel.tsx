'use client'
import React from 'react'
import axios from 'axios';
import { FcGoogle } from 'react-icons/fc';
import { useCallback, useState } from 'react';
import { signIn } from 'next-auth/react';
import {
  Field,
    FieldValues,
    SubmitHandler,
    useForm
} from 'react-hook-form';
import useLoginModel from '@/app/hooks/useLoginModel';
import useRegisterModel from '@/app/hooks/useRegisterModel';
import Model from './model';
import Heading from '../heading';
import Input from '../Inputs/input';
import toast from 'react-hot-toast';
import Button from '../button';
import { useRouter } from 'next/navigation';


const LoginModel = () => {
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
        email: '',
        password: ''
    }
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);
    
    signIn('credentials', {
        ...data,
        redirect: false,
    })
    .then((callback) => {
        setIsLoading(false);
        if(callback?.ok){
            toast.success('Logged in');
            router.refresh();
            loginModel.onClose();
        }
        if(callback?.error){
            toast.error(callback.error);
        }
    })
  }

  const toggle = useCallback(() => {
    loginModel.onClose();
    registerModel.onOpen();
  }, [loginModel, registerModel])

  const bodyContent = (
    <div className='flex flex-col gap-4'>
      	<Heading 
          title='Welcome back'
          subtitle='Login to your account!'
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
          <div>First time using Tradeez?</div>
          <div onClick={toggle} className='text-neutral-800 cursor-pointer hover:underline'>Create an account</div>
        </div>
        <div className="hover:cursor-pointer" onClick={() => router.push('/request-reset')}>Reset Password</div>
      </div>
    </div>
  )

  return (
    <Model 
      disabled={isLoading}
      isOpen={loginModel.isOpen}
      title='Login'
      actionLabel='Continue'
      onClose={loginModel.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
      footer={footerContent}
    />
  )
}

export default LoginModel