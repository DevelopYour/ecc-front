import { ReactNode } from "react";

export enum ButtonVariant {
    PRIMARY = "primary",
    SECONDARY = "secondary",
    DANGER = "danger",
}

export interface ModalButton {
    label: string;
    onClick: () => void;
    variant?: ButtonVariant;
}

interface ModalProps {
    title?: string;
    content: ReactNode;
    buttons?: ModalButton[];
    onClose: () => void;
    isOpen: boolean;
}

const getButtonClass = (variant: ButtonVariant = ButtonVariant.SECONDARY) => {
    switch (variant) {
        case ButtonVariant.PRIMARY:
            return "bg-blue-600 text-white hover:bg-blue-700";
        case ButtonVariant.DANGER:
            return "bg-red-600 text-white hover:bg-red-700";
        case ButtonVariant.SECONDARY:
        default:
            return "bg-c-green text-white hover:bg-blue-700";
    }
};

export const Modal = ({ title, content, buttons, onClose, isOpen }: ModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white p-6 rounded-2xl shadow-lg w-[90%] max-w-md text-center flex flex-col items-center">
                {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
                <div className="mb-6">{content}</div>
                <div className="flex justify-center gap-2">
                    {buttons?.map((btn, idx) => (
                        <button
                            key={idx}
                            onClick={btn.onClick}
                            className={`px-4 py-2 rounded text-sm font-medium transition ${getButtonClass(btn.variant)}`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>

    );
};
