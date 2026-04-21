import { useNavigate } from 'react-router-dom';
import UserRegistrationForm from '@/components/UserRegistrationForm';

export default function Register() {
  const navigate = useNavigate();

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-primary mb-4">Register Free</h1>
          <p className="text-muted-foreground">Find your divine match today. It only takes a few minutes.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border-t-4 border-t-secondary p-6 md:p-10">
          <UserRegistrationForm onSuccess={() => navigate('/login')} />
        </div>
      </div>
    </div>
  );
}
