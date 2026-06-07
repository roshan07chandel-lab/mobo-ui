import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Smartphone, Mail, Lock, AlertCircle } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'superAdmin') {
        navigate('/super/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid credentials or connection issue.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (testEmail) => {
    setEmail(testEmail);
    setPassword('password');
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden bg-[#0a0f1d] px-4">
      {/* Background Floating Decorative Nodes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[150px] animate-pulse" />

      {/* Dynamic Animated background items */}
      <div className="absolute w-24 h-24 rounded-full bg-primary/20 blur-md top-1/4 left-1/5 animate-float" style={{ animationDelay: '0s', animationDuration: '25s' }} />
      <div className="absolute w-32 h-32 rounded-full bg-secondary/20 blur-md bottom-1/4 right-1/4 animate-float" style={{ animationDelay: '5s', animationDuration: '30s' }} />
      <div className="absolute w-16 h-16 rounded-full bg-violet-500/10 blur-sm top-2/3 left-1/3 animate-float" style={{ animationDelay: '2s', animationDuration: '20s' }} />

      {/* Login Card Panel */}
      <div className="w-full max-w-lg z-10">
        <GlassCard className="!p-8 hover:shadow-glow-secondary hover:border-secondary/20 border-white/5 shadow-2xl relative">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-glow-primary mb-4">
              <Smartphone size={32} className="text-white" />
            </div>
            <h2 className="text-3xl font-extrabold font-heading text-white tracking-wide">
              Mobo-Care
            </h2>
            <p className="text-muted text-sm mt-1.5 font-medium">
              Device Repairs & inventory Ecosystem
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-status-rose/10 border border-status-rose/30 text-status-rose text-sm flex items-center space-x-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@mobocare.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full py-3 mt-2 font-heading tracking-wide"
              isLoading={isLoading}
            >
              Sign In to Terminal
            </Button>
          </form>

        </GlassCard>
      </div>
    </div>
  );
};

export default Login;
