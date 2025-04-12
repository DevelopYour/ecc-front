// context/ModalContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";
import { Modal, ModalButton } from "../components/Modal";

interface ModalContextType {
    showModal: (options: {
        title?: string;
        content: ReactNode;
        buttons?: ModalButton[];
    }) => void;
    closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) throw new Error("useModal must be used within ModalProvider");
    return context;
};

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState<string | undefined>();
    const [content, setContent] = useState<ReactNode>(null);
    const [buttons, setButtons] = useState<ModalButton[] | undefined>();

    const showModal = ({ title, content, buttons }: ModalContextType["showModal"] extends (a: infer T) => void ? T : never) => {
        setTitle(title);
        setContent(content);
        setButtons(buttons);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setTitle(undefined);
        setContent(null);
        setButtons(undefined);
    };

    return (
        <ModalContext.Provider value={{ showModal, closeModal }}>
            {children}
            <Modal title={title} content={content} buttons={buttons} onClose={closeModal} isOpen={isOpen} />
        </ModalContext.Provider>
    );
};
