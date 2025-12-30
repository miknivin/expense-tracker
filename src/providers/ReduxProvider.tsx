"use client";
import { store } from "@/redux/store";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <>  
      <ToastContainer
        position="top-right"           // Top-right corner
        autoClose={1500}               // Closes after 1.5 seconds
        hideProgressBar={false}        // Optional: keeps a thin progress bar
        newestOnTop={true}             // New toasts appear on top
        closeOnClick                   // Click toast to dismiss
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"                  // or "dark" / "colored" based on your app
        toastClassName="font-medium"   // Optional: better typography
        style={{ zIndex: 99999999999999 }}      // Critical: highest z-index to stay on top
      />
      <Provider store={store}>
        {children}
      </Provider>
    </>
  );
}