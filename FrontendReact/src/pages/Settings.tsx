import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logout } from "@/services/services.auth";
import { fetchDiscountSettings, updateDiscountSettings, type DiscountSettings } from "@/services/services.settings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, LogOut, Palette, Percent, Save, Shield, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useContext, useEffect, useState } from "react";
import { UNSAFE_NavigationContext, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State for discount settings
  const [discountFormData, setDiscountFormData] = useState<DiscountSettings>({
    auto_discount_enabled: true,
    discount_tier_1_qty: 6,
    discount_tier_1_percent: 5,
    discount_tier_2_qty: 10,
    discount_tier_2_percent: 10,
  });

  // State for profile settings
  const [profileFormData, setProfileFormData] = useState({
    name: "Mabel Diallo",
    email: "mabel@boutique.sn",
    phone: "77 123 45 67",
    address: "Médina, Dakar, Sénégal",
  });

  // State for preferences settings
  const [preferencesFormData, setPreferencesFormData] = useState({
    language: "fr",
    currency: "fcfa",
    dateFormat: "dd/mm/yyyy",
  });

  // State for notifications settings
  const [notificationsFormData, setNotificationsFormData] = useState({
    lowStockAlert: true,
    creditAlert: true,
    newSaleAlert: false,
    dailyReport: true,
    weeklyReport: true,
  });

  // State for security settings
  const [securityFormData, setSecurityFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Original data to compare against
  const [originalProfileData, setOriginalProfileData] = useState(profileFormData);
  const [originalPreferencesData, setOriginalPreferencesData] = useState(preferencesFormData);
  const [originalNotificationsData, setOriginalNotificationsData] = useState(notificationsFormData);

  // State pour suivre les modifications non sauvegardées
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [showNavigationDialog, setShowNavigationDialog] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState("profile");
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  
  const location = useLocation();
  const navigation = useContext(UNSAFE_NavigationContext).navigator as any;

  // Fetch discount settings
  const { data: discountSettings } = useQuery({
    queryKey: ["discountSettings"],
    queryFn: fetchDiscountSettings,
  });

  // Update form data when settings are loaded
  useEffect(() => {
    if (discountSettings) {
      setDiscountFormData(discountSettings);
      setHasUnsavedChanges(false);
    }
  }, [discountSettings]);

  // Détecter les changements dans tous les formulaires
  useEffect(() => {
    let hasChanges = false;

    // Vérifier les changements de remise
    if (discountSettings) {
      hasChanges = hasChanges || JSON.stringify(discountFormData) !== JSON.stringify(discountSettings);
    }

    // Vérifier les changements de profil
    hasChanges = hasChanges || JSON.stringify(profileFormData) !== JSON.stringify(originalProfileData);

    // Vérifier les changements de préférences
    hasChanges = hasChanges || JSON.stringify(preferencesFormData) !== JSON.stringify(originalPreferencesData);

    // Vérifier les changements de notifications
    hasChanges = hasChanges || JSON.stringify(notificationsFormData) !== JSON.stringify(originalNotificationsData);

    // Vérifier les changements de sécurité (mot de passe)
    hasChanges = hasChanges || (securityFormData.currentPassword !== "" || securityFormData.newPassword !== "" || securityFormData.confirmPassword !== "");

    setHasUnsavedChanges(hasChanges);
  }, [discountFormData, discountSettings, profileFormData, originalProfileData, preferencesFormData, originalPreferencesData, notificationsFormData, originalNotificationsData, securityFormData]);

  // Fonctions helper pour détecter les changements par onglet
  const hasProfileChanges = () => JSON.stringify(profileFormData) !== JSON.stringify(originalProfileData);
  const hasDiscountChanges = () => discountSettings ? JSON.stringify(discountFormData) !== JSON.stringify(discountSettings) : false;
  const hasPreferencesChanges = () => JSON.stringify(preferencesFormData) !== JSON.stringify(originalPreferencesData);
  const hasNotificationsChanges = () => JSON.stringify(notificationsFormData) !== JSON.stringify(originalNotificationsData);
  const hasSecurityChanges = () => securityFormData.currentPassword !== "" || securityFormData.newPassword !== "" || securityFormData.confirmPassword !== "";

  // Avertir l'utilisateur avant de quitter la page si des modifications ne sont pas sauvegardées
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter ?";
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Update mutation for discount settings
  const updateDiscountMutation = useMutation({
    mutationFn: updateDiscountSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discountSettings"] });
      toast.success("Paramètres de remise mis à jour avec succès");
      setHasUnsavedChanges(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
    },
  });

  const handleTabChange = (value: string) => {
    if (hasUnsavedChanges) {
      setPendingTab(value);
      setShowUnsavedDialog(true);
    } else {
      setCurrentTab(value);
    }
  };

  const handleConfirmTabChange = () => {
    // Réinitialiser tous les formulaires avec les données originales
    if (discountSettings) {
      setDiscountFormData(discountSettings);
    }
    setProfileFormData(originalProfileData);
    setPreferencesFormData(originalPreferencesData);
    setNotificationsFormData(originalNotificationsData);
    setSecurityFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setHasUnsavedChanges(false);
    setShowUnsavedDialog(false);
    if (pendingTab) {
      setCurrentTab(pendingTab);
      setPendingTab(null);
    }
  };

  const handleCancelTabChange = () => {
    setShowUnsavedDialog(false);
    setPendingTab(null);
  };

  const handleConfirmNavigation = useCallback(() => {
    setHasUnsavedChanges(false);
    setShowNavigationDialog(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  }, [pendingNavigation]);

  const handleCancelNavigation = useCallback(() => {
    setShowNavigationDialog(false);
    setPendingNavigation(null);
  }, []);

  // Intercepter la navigation du navigateur
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const originalPush = navigation.push;
    const originalReplace = navigation.replace;

    navigation.push = (...args: any[]) => {
      const targetLocation = args[0];
      const targetPath = typeof targetLocation === 'string' ? targetLocation : targetLocation.pathname;
      
      if (targetPath !== location.pathname) {
        setPendingNavigation(() => () => originalPush.apply(navigation, args));
        setShowNavigationDialog(true);
      } else {
        originalPush.apply(navigation, args);
      }
    };

    navigation.replace = (...args: any[]) => {
      const targetLocation = args[0];
      const targetPath = typeof targetLocation === 'string' ? targetLocation : targetLocation.pathname;
      
      if (targetPath !== location.pathname) {
        setPendingNavigation(() => () => originalReplace.apply(navigation, args));
        setShowNavigationDialog(true);
      } else {
        originalReplace.apply(navigation, args);
      }
    };

    return () => {
      navigation.push = originalPush;
      navigation.replace = originalReplace;
    };
  }, [hasUnsavedChanges, location.pathname, navigation]);

  const handleSaveDiscountSettings = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (discountFormData.discount_tier_2_qty < discountFormData.discount_tier_1_qty) {
      toast.error("La quantité du niveau 2 doit être supérieure ou égale au niveau 1");
      return;
    }

    if (discountFormData.discount_tier_1_percent < 0 || discountFormData.discount_tier_1_percent > 100) {
      toast.error("Le pourcentage de remise doit être entre 0 et 100");
      return;
    }

    if (discountFormData.discount_tier_2_percent < 0 || discountFormData.discount_tier_2_percent > 100) {
      toast.error("Le pourcentage de remise doit être entre 0 et 100");
      return;
    }

    updateDiscountMutation.mutate(discountFormData);
  };

  const handleSaveProfile = () => {
    setOriginalProfileData(profileFormData);
    toast.success("Profil mis à jour avec succès !");
  };

  const handleSavePreferences = () => {
    setOriginalPreferencesData(preferencesFormData);
    toast.success("Préférences mises à jour avec succès !");
  };

  const handleSaveNotifications = () => {
    setOriginalNotificationsData(notificationsFormData);
    toast.success("Notifications mises à jour avec succès !");
  };

  const handleSavePassword = () => {
    if (!securityFormData.currentPassword || !securityFormData.newPassword) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    if (securityFormData.newPassword !== securityFormData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    setSecurityFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    toast.success("Mot de passe modifié avec succès !");
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Nettoyer le localStorage
      localStorage.removeItem('user');
      // Invalider toutes les queries
      queryClient.clear();
      // Afficher un message de succès
      toast.success("Déconnexion réussie");
      // Rediriger vers la page de connexion
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">Paramètres</h2>
        </div>

        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              Profil
              {hasProfileChanges() && (
                <span className="ml-1 h-2 w-2 rounded-full bg-destructive" />
              )}
            </TabsTrigger>
            <TabsTrigger value="discount" className="gap-2">
              <Percent className="w-4 h-4" />
              Remises
              {hasDiscountChanges() && (
                <span className="ml-1 h-2 w-2 rounded-full bg-destructive" />
              )}
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Palette className="w-4 h-4" />
              Préférences
              {hasPreferencesChanges() && (
                <span className="ml-1 h-2 w-2 rounded-full bg-destructive" />
              )}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
              {hasNotificationsChanges() && (
                <span className="ml-1 h-2 w-2 rounded-full bg-destructive" />
              )}
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              Sécurité
              {hasSecurityChanges() && (
                <span className="ml-1 h-2 w-2 rounded-full bg-destructive" />
              )}
            </TabsTrigger>
          </TabsList>

          {/* Profil */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations Personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">M</span>
                  </div>
                  <div>
                    <Button variant="outline">Changer la photo</Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG ou WEBP. Max 2MB
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom complet</Label>
                    <Input 
                      value={profileFormData.name}
                      onChange={(e) => setProfileFormData({ ...profileFormData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email" 
                      value={profileFormData.email}
                      onChange={(e) => setProfileFormData({ ...profileFormData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Téléphone</Label>
                    <Input 
                      value={profileFormData.phone}
                      onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rôle</Label>
                    <Input value="Administrateur" disabled />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Adresse de la boutique</Label>
                    <Input 
                      value={profileFormData.address}
                      onChange={(e) => setProfileFormData({ ...profileFormData, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveProfile}>Enregistrer les modifications</Button>
                  <Button variant="outline">Annuler</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discount Settings */}
          <TabsContent value="discount" className="space-y-6">
            <form onSubmit={handleSaveDiscountSettings}>
              <Card>
                <CardHeader>
                  <CardTitle>Remise Automatique</CardTitle>
                  <CardDescription>
                    Configuration des remises automatiques basées sur la quantité totale d'articles
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Enable/Disable */}
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto_discount_enabled" className="text-base">
                        Activer la remise automatique
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Appliquer automatiquement des remises selon la quantité
                      </p>
                    </div>
                    <Switch
                      id="auto_discount_enabled"
                      checked={discountFormData.auto_discount_enabled}
                      onCheckedChange={(checked) =>
                        setDiscountFormData({ ...discountFormData, auto_discount_enabled: checked })
                      }
                    />
                  </div>

                  {discountFormData.auto_discount_enabled && (
                    <>
                      {/* Tier 1 */}
                      <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
                        <h3 className="font-semibold text-lg">Niveau 1</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="discount_tier_1_qty">
                              Quantité minimale *
                            </Label>
                            <Input
                              id="discount_tier_1_qty"
                              type="number"
                              min="1"
                              value={discountFormData.discount_tier_1_qty}
                              onChange={(e) =>
                                setDiscountFormData({
                                  ...discountFormData,
                                  discount_tier_1_qty: parseInt(e.target.value) || 0,
                                })
                              }
                              required
                            />
                            <p className="text-xs text-muted-foreground">
                              Nombre d'articles pour activer cette remise
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="discount_tier_1_percent">
                              Pourcentage de remise (%) *
                            </Label>
                            <Input
                              id="discount_tier_1_percent"
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={discountFormData.discount_tier_1_percent}
                              onChange={(e) =>
                                setDiscountFormData({
                                  ...discountFormData,
                                  discount_tier_1_percent: parseFloat(e.target.value) || 0,
                                })
                              }
                              required
                            />
                            <p className="text-xs text-muted-foreground">
                              Entre 0 et 100
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Tier 2 */}
                      <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
                        <h3 className="font-semibold text-lg">Niveau 2</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="discount_tier_2_qty">
                              Quantité minimale *
                            </Label>
                            <Input
                              id="discount_tier_2_qty"
                              type="number"
                              min="1"
                              value={discountFormData.discount_tier_2_qty}
                              onChange={(e) =>
                                setDiscountFormData({
                                  ...discountFormData,
                                  discount_tier_2_qty: parseInt(e.target.value) || 0,
                                })
                              }
                              required
                            />
                            <p className="text-xs text-muted-foreground">
                              Doit être ≥ au niveau 1
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="discount_tier_2_percent">
                              Pourcentage de remise (%) *
                            </Label>
                            <Input
                              id="discount_tier_2_percent"
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={discountFormData.discount_tier_2_percent}
                              onChange={(e) =>
                                setDiscountFormData({
                                  ...discountFormData,
                                  discount_tier_2_percent: parseFloat(e.target.value) || 0,
                                })
                              }
                              required
                            />
                            <p className="text-xs text-muted-foreground">
                              Entre 0 et 100
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Exemple */}
                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <h4 className="font-medium text-sm mb-2 text-blue-600 dark:text-blue-400">
                          Exemple avec la configuration actuelle :
                        </h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>
                            • {discountFormData.discount_tier_1_qty} à {discountFormData.discount_tier_2_qty - 1} articles →{" "}
                            <span className="font-semibold text-foreground">
                              {discountFormData.discount_tier_1_percent}% de remise
                            </span>
                          </li>
                          <li>
                            • {discountFormData.discount_tier_2_qty}+ articles →{" "}
                            <span className="font-semibold text-foreground">
                              {discountFormData.discount_tier_2_percent}% de remise
                            </span>
                          </li>
                        </ul>
                      </div>
                    </>
                  )}

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={updateDiscountMutation.isPending}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {updateDiscountMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </TabsContent>

          {/* Préférences */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Apparence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Thème</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Clair</SelectItem>
                      <SelectItem value="dark">Sombre</SelectItem>
                      <SelectItem value="system">Système</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Langue</Label>
                  <Select 
                    value={preferencesFormData.language} 
                    onValueChange={(value) => setPreferencesFormData({ ...preferencesFormData, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Devise</Label>
                  <Select 
                    value={preferencesFormData.currency} 
                    onValueChange={(value) => setPreferencesFormData({ ...preferencesFormData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fcfa">FCFA (XOF)</SelectItem>
                      <SelectItem value="eur">Euro (EUR)</SelectItem>
                      <SelectItem value="usd">Dollar (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSavePreferences}>Enregistrer</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Format</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Format de date</Label>
                  <Select 
                    value={preferencesFormData.dateFormat} 
                    onValueChange={(value) => setPreferencesFormData({ ...preferencesFormData, dateFormat: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alertes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alerte stock faible</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir une notification quand un produit atteint son seuil d'alerte
                    </p>
                  </div>
                  <Switch 
                    checked={notificationsFormData.lowStockAlert}
                    onCheckedChange={(checked) => setNotificationsFormData({ ...notificationsFormData, lowStockAlert: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alerte créances</Label>
                    <p className="text-sm text-muted-foreground">
                      Notification pour les créances de plus de 7 jours
                    </p>
                  </div>
                  <Switch 
                    checked={notificationsFormData.creditAlert}
                    onCheckedChange={(checked) => setNotificationsFormData({ ...notificationsFormData, creditAlert: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Nouvelle vente</Label>
                    <p className="text-sm text-muted-foreground">
                      Notification à chaque nouvelle vente enregistrée
                    </p>
                  </div>
                  <Switch 
                    checked={notificationsFormData.newSaleAlert}
                    onCheckedChange={(checked) => setNotificationsFormData({ ...notificationsFormData, newSaleAlert: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Rapport quotidien</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir un résumé par email chaque jour à 18h
                    </p>
                  </div>
                  <Switch 
                    checked={notificationsFormData.dailyReport}
                    onCheckedChange={(checked) => setNotificationsFormData({ ...notificationsFormData, dailyReport: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Rapport hebdomadaire</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir un rapport complet chaque lundi matin
                    </p>
                  </div>
                  <Switch 
                    checked={notificationsFormData.weeklyReport}
                    onCheckedChange={(checked) => setNotificationsFormData({ ...notificationsFormData, weeklyReport: checked })}
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveNotifications}>Enregistrer</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sécurité */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Changer le mot de passe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Mot de passe actuel</Label>
                  <Input 
                    type="password"
                    value={securityFormData.currentPassword}
                    onChange={(e) => setSecurityFormData({ ...securityFormData, currentPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nouveau mot de passe</Label>
                  <Input 
                    type="password"
                    value={securityFormData.newPassword}
                    onChange={(e) => setSecurityFormData({ ...securityFormData, newPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirmer le mot de passe</Label>
                  <Input 
                    type="password"
                    value={securityFormData.confirmPassword}
                    onChange={(e) => setSecurityFormData({ ...securityFormData, confirmPassword: e.target.value })}
                  />
                </div>
                <Button onClick={handleSavePassword}>Modifier le mot de passe</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sessions Actives</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">Session actuelle</p>
                    <p className="text-sm text-muted-foreground">
                      Chrome sur Windows • Dakar, Sénégal
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Dernière activité: Il y a 2 minutes
                    </p>
                  </div>
                  <Badge className="bg-success">Active</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Zone Dangereuse</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Déconnexion</p>
                    <p className="text-sm text-muted-foreground">
                      Se déconnecter de cette session
                    </p>
                  </div>
                  <Button variant="destructive" className="gap-2" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog pour les modifications non sauvegardées lors du changement d'onglet */}
        <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Modifications non enregistrées</AlertDialogTitle>
              <AlertDialogDescription>
                Vous avez des modifications non enregistrées. 
                Si vous continuez, ces modifications seront perdues. Voulez-vous vraiment continuer ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelTabChange}>
                Rester ici
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmTabChange}>
                Abandonner les modifications
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog pour les modifications non sauvegardées lors de la navigation */}
        <AlertDialog open={showNavigationDialog} onOpenChange={setShowNavigationDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Modifications non enregistrées</AlertDialogTitle>
              <AlertDialogDescription>
                Vous avez des modifications non enregistrées. 
                Si vous quittez cette page, ces modifications seront perdues. Voulez-vous vraiment continuer ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelNavigation}>
                Rester ici
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmNavigation}>
                Quitter sans enregistrer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
};

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export default Settings;
