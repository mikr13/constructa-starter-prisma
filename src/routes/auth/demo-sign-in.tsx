;
import { SignInForm } from '~/components/auth/sign-in-form';

export const Route = createFileRoute({
  component: SignInDemo,
});

function SignInDemo() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAE7D8]">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg p-8 md:p-10 flex flex-col">
        <h1 className="text-3xl font-extrabold text-center mb-3">Welcome to Constructa</h1>
        <p className="text-center text-gray-600 mb-8">
          Constructa is an all-in-one doc that brings words, data, and teams together. Sign in to
          access your docs.
        </p>

        <SignInForm />
      </div>
    </div>
  );
}
