import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, User, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { register } from '@/services/services.auth';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });
      toast.success('Compte créé avec succès !');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur d\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/20 via-background to-muted p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-card/80 backdrop-blur-xl">
        <CardHeader className="text-center space-y-1">
          <div className="w-20 h-20 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-secondary" />
          </div>
          <CardTitle className="text-3xl">Créer un compte</CardTitle>
          <CardDescription className="text-lg">
            Rejoignez Mabel en quelques secondes
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nom complet
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Fatoumata Diallo"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="fatou@mabel.sn"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  type="password"
                  placeholder="8+ caractères"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation" className="text-sm font-medium">
                Confirmer mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  placeholder="Répétez le mot de passe"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer mon compte'
              )}
            </Button>
          </form>

          <div className="text-center pt-6">
            <p className="text-sm text-muted-foreground">
              Déjà un compte ?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Se connecter
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
