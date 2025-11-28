import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { login } from '@/services/services.auth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({ email, password });
      toast.success('Connexion réussie !');
        navigate('/', { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-muted p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-card/80 backdrop-blur-xl">
        <CardHeader className="text-center space-y-1">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Bienvenue</CardTitle>
          <CardDescription className="text-lg">
            Connectez-vous à votre compte Mabel
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@mabel.sn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="password123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              Pas de compte ?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Créer un compte
              </button>
            </p>
          </div>

          <div className="text-xs text-center text-muted-foreground pt-4 border-t">
            <p>👉 Test: admin@mabel.sn / password123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
