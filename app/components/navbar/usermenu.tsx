'use client'
import React, { useCallback, useState, useRef, useEffect } from 'react'
import { AiOutlineMenu } from 'react-icons/ai'
import Avatar from '../avatar'
import MenuItem from './menuItem'
import useRegisterModel from '@/app/hooks/useRegisterModel'
import useLoginModel from '@/app/hooks/useLoginModel'
import { SafeUser } from '@/app/types'
import { signOut } from 'next-auth/react'
import useServiceModel from '@/app/hooks/useServiceModel'
import { useRouter } from 'next/navigation'

interface UserMenuProps {
  currentUser?: SafeUser | null
}

const UserMenu: React.FC<UserMenuProps> = ({ currentUser }) => {
  const registerModel = useRegisterModel();
  const loginModel = useLoginModel();
  const serviceModel = useServiceModel();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const onList = useCallback(() => {
    if (!currentUser) {
      loginModel.onOpen();
    } else {
      serviceModel.onOpen();
    }
  }, [currentUser, loginModel, serviceModel]);

  // Helper to close menu and then run the action
  const handleMenuItemClick = (callback: () => void) => {
    setIsOpen(false);
    callback();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className='relative' ref={menuRef}>
      <div className='flex flex-row items-center gap-3'>
        <div 
          onClick={onList} 
          className='hidden md:block text-sm font-semibold py-3 px-4 rounded-full hover:bg-neutral-100 transition cursor-pointer'
        >
          List Your Service
        </div>
        <div 
          onClick={toggleOpen} 
          className='p-4 md:py-1 md:px-2 border-[1px] border-neutral-200 flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md transition'
        >
          <AiOutlineMenu />
          <div className='hidden md:block'>
            <Avatar src={currentUser?.image} />
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="absolute rounded-xl shadow-md w-[40vw] md:w-4/5 bg-white overflow-hidden right-0 top-12 text-sm">
          <div className="flex flex-col cursor-pointer px-4 py-3">
            {(() => {
              if (currentUser && currentUser.plan === "premium") {
                return (
                  <>
                    <MenuItem onClick={() => handleMenuItemClick(() => router.push("/"))} label="Home" />
                    <MenuItem onClick={() => handleMenuItemClick(() => router.push("/favorites"))} label="My Favorites" />
                    <MenuItem onClick={() => handleMenuItemClick(() => router.push("/jobs"))} label="Job Listings" />

                    {/* Quotation Section */}
                    <div className="mt-3 mb-1 px-3 text-rose-600 font-semibold uppercase tracking-wide select-none">
                      My Listing
                    </div>
                    <div className='flex flex-col space-y-1 ml-4'>
                      <MenuItem onClick={() => handleMenuItemClick(() => router.push("/services"))} label="My Service" />
                      <MenuItem onClick={() => handleMenuItemClick(serviceModel.onOpen)} label="Add Service" />
                    </div>
                    <div className="mt-3 mb-1 px-3 text-rose-600 font-semibold uppercase tracking-wide select-none">
                      Quotation
                    </div>
                    <div className="flex flex-col space-y-1 ml-4">
                      <MenuItem onClick={() => handleMenuItemClick(() => router.push("/create-a-quote"))} label="Create Quote" />
                      <MenuItem onClick={() => handleMenuItemClick(() => router.push("/my-quotes"))} label="My Quotes" />
                    </div>
                    <div className="mt-3 mb-1 px-3 text-rose-600 font-semibold uppercase tracking-wide select-none">
                      Invoicing
                    </div>
                    <div className="flex flex-col space-y-1 ml-4">
                      <MenuItem onClick={() => handleMenuItemClick(() => router.push("/create-an-invoice"))} label="Create Invoice" />
                      <MenuItem onClick={() => handleMenuItemClick(() => router.push("/my-invoices"))} label="My Invoices" />
                    </div>

                    <MenuItem onClick={() => handleMenuItemClick(() => router.push("/contact"))} label="Contact Us" />
                    <hr className="my-2" />
                    <MenuItem onClick={() => handleMenuItemClick(() => signOut())} label="Logout" />
                  </>
                );
              } else if (currentUser && currentUser.plan === "free") {
                return (
                  <>
                    <MenuItem onClick={() => handleMenuItemClick(() => router.push("/"))} label="Home" />
                    <MenuItem onClick={() => handleMenuItemClick(() => router.push("/jobs"))} label="Job Listings" />
                    <MenuItem onClick={() => handleMenuItemClick(serviceModel.onOpen)} label="List My Service" />
                    <MenuItem onClick={() => handleMenuItemClick(() => router.push("/contact"))} label="Contact Us" />
                    <hr className="my-2" />
                    <MenuItem onClick={() => handleMenuItemClick(() => signOut())} label="Logout" />
                  </>
                );
              } else {
                // No user logged in
                return (
                  <>
                    <MenuItem onClick={() => handleMenuItemClick(() => router.push("/"))} label="Home" />
                    <MenuItem onClick={() => handleMenuItemClick(() => router.push("/jobs"))} label="Job Listings" />
                    <MenuItem onClick={() => handleMenuItemClick(loginModel.onOpen)} label="Login" />
                    <MenuItem onClick={() => handleMenuItemClick(registerModel.onOpen)} label="Sign Up" />
                    <MenuItem onClick={() => handleMenuItemClick(() => router.push("/contact"))} label="Contact Us" />
                  </>
                );
              }
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
