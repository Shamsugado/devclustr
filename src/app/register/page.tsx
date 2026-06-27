import RegisterForm from "@/components/auth/RegisterForm";
import Navbar from "@/components/homepage/Navbar";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center p-4">
        <RegisterForm />
      </div>
    </div>
  );
}
