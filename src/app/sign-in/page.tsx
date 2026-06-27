import { Suspense } from "react";
import SignInForm from "@/components/auth/SignInForm";
import Navbar from "@/components/homepage/Navbar";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center p-4">
        <Suspense>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}
