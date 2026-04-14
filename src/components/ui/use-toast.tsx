export interface Toast {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

let toastCallback: ((toast: Toast) => void) | null = null;

export const setToastCallback = (callback: (toast: Toast) => void) => {
  toastCallback = callback;
};

export const useToast = () => {
  const toast = (config: Toast) => {
    if (toastCallback) {
      toastCallback(config);
    } else {
      console.log('Toast:', config);
    }
  };

  return { toast };
};
