// components/ui/Drawer.tsx  (or wherever you keep UI components)

import { ReactNode } from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  id?: string; // optional custom id for data-drawer attributes
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  id = 'drawer-right-example',
}: DrawerProps) {
  // Tailwind classes for open/close animation
  const translateClass = isOpen ? 'translate-x-0' : 'translate-x-full';

  return (
    <div
      id={id}
      className={`fixed top-0 right-0 z-9999999 h-dvh p-4 overflow-y-auto transition-transform ${translateClass} bg-white w-80 dark:bg-gray-800`}
      tabIndex={-1}
      aria-labelledby={`${id}-label`}
    >
      {/* Header with title and info icon */}
      <h5
        id={`${id}-label`}
        className="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400"
      >
        <svg
          className="w-4 h-4 me-2.5"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
        </svg>
        {title}
      </h5>

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        data-drawer-hide={id}
        aria-controls={id}
        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
      >
        <svg
          className="w-3 h-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 14"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
          />
        </svg>
        <span className="sr-only">Close menu</span>
      </button>

      {/* Main content area - now accepts children */}
      <div className="mt-8">{children}</div>
    </div>
  );
}