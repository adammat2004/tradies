import { create } from 'zustand';

interface ServiceModelStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

const useServiceModel = create<ServiceModelStore>((set) => ({
    isOpen: false,
    onOpen: () => set({isOpen: true}),
    onClose: () => set({isOpen: false}),
}));

export default useServiceModel;