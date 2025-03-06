import { create } from 'zustand';

interface JobSearchModelStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

const useJobSearchModel = create<JobSearchModelStore>((set) => ({
    isOpen: false,
    onOpen: () => set({isOpen: true}),
    onClose: () => set({isOpen: false}),
}));

export default useJobSearchModel;