import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import FramedAvatar from '@/components/FramedAvatar';

interface User {
  id: number;
  email: string;
  username: string;
  display_name: string;
  avatar_url: string;
  balance: number;
  role: string;
  is_verified: boolean;
  is_banned: boolean;
  ownedGames?: number[];
}

interface Game {
  id: number;
  title: string;
  description: string;
  price: number;
  logo_url: string;
  status: string;
  developer_email?: string;
  genre?: string;
  age_rating?: string;
  file_url?: string;
  screenshots?: string[];
  publisher_username?: string;
  is_featured?: boolean;
}

interface Frame {
  id: number;
  name: string;
  price: number;
  image_url: string;
  is_active?: boolean;
}

interface MarketItem {
  id: number;
  seller_id: number;
  item_type: string;
  item_id: number;
  price: number;
  seller_username: string;
  item_name: string;
  item_image: string;
}

const API_URLS = {
  auth: 'https://functions.poehali.dev/4f888d7d-793d-4f97-ba82-b4122ee1d441',
  users: 'https://functions.poehali.dev/c7dee73a-13a1-44fa-9ad2-4c0d06c6e214',
  games: 'https://functions.poehali.dev/cbedd089-c133-44a2-9397-80b1f0738c13',
  frames: 'https://functions.poehali.dev/d87cf32c-099b-43eb-b9b3-70e6b0ae2040',
  marketplace: 'https://functions.poehali.dev/28fefeef-323b-4e2f-aa90-2b6a904ef909'
};

export default function Index() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [pendingGames, setPendingGames] = useState<Game[]>([]);
  const [currentView, setCurrentView] = useState<'store' | 'library' | 'profile' | 'friends' | 'admin' | 'market' | 'user-profile' | 'inventory' | 'featured' | 'frames-shop'>('store');
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showCreateFrame, setShowCreateFrame] = useState(false);
  const [showSellDialog, setShowSellDialog] = useState(false);
  const [searchUsers, setSearchUsers] = useState('');
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [userFrames, setUserFrames] = useState<Frame[]>([]);
  const [allFrames, setAllFrames] = useState<Frame[]>([]);
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [activeFrame, setActiveFrame] = useState<string | null>(null);
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [newBalance, setNewBalance] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  const [newGame, setNewGame] = useState({
    title: '',
    description: '',
    price: '',
    developer_email: '',
    genre: '',
    age_rating: '',
    file_url: '',
    logo_url: ''
  });
  
  const [editProfile, setEditProfile] = useState({
    display_name: '',
    username: '',
    avatar_url: ''
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    loadGames();
  }, []);
  
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      loadUserFrames();
      loadMarketItems();
      loadFeaturedGames();
      loadAllFrames();
      if (currentUser.role === 'admin') {
        loadAllUsers();
        loadPendingGames();
      }
    }
  }, [currentUser]);

  const loadGames = async () => {
    try {
      const response = await fetch(`${API_URLS.games}?status=approved`);
      const data = await response.json();
      setGames(data.games || []);
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };
  
  const loadAllUsers = async () => {
    try {
      const response = await fetch(API_URLS.users);
      const data = await response.json();
      setAllUsers(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };
  
  const loadPendingGames = async () => {
    try {
      const response = await fetch(`${API_URLS.games}?status=pending`);
      const data = await response.json();
      setPendingGames(data.games || []);
    } catch (error) {
      console.error('Error loading pending games:', error);
    }
  };
  
  const loadUserFrames = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch(`${API_URLS.frames}?user_id=${currentUser.id}`);
      const data = await response.json();
      setUserFrames(data.frames || []);
      const active = data.frames?.find((f: Frame) => f.is_active);
      if (active) setActiveFrame(active.image_url);
    } catch (error) {
      console.error('Error loading frames:', error);
    }
  };
  
  const loadAllFrames = async () => {
    try {
      const response = await fetch(API_URLS.frames);
      const data = await response.json();
      setAllFrames(data.frames || []);
    } catch (error) {
      console.error('Error loading frames:', error);
    }
  };
  
  const loadMarketItems = async () => {
    try {
      const response = await fetch(API_URLS.marketplace);
      const data = await response.json();
      setMarketItems(data.items || []);
    } catch (error) {
      console.error('Error loading market:', error);
    }
  };
  
  const loadFeaturedGames = async () => {
    try {
      const response = await fetch(`${API_URLS.games}?status=approved`);
      const data = await response.json();
      setFeaturedGames(data.games?.filter((g: Game) => g.is_featured) || []);
    } catch (error) {
      console.error('Error loading featured games:', error);
    }
  };

  const handleAuth = async () => {
    try {
      const response = await fetch(API_URLS.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: authMode === 'login' ? 'login' : 'register',
          email,
          password,
          username: authMode === 'register' ? username : undefined
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCurrentUser(data.user);
        toast.success(authMode === 'login' ? 'Добро пожаловать!' : 'Регистрация успешна!');
      } else {
        toast.error(data.error || 'Произошла ошибка');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setCurrentView('store');
    setEmail('');
    setPassword('');
    setUsername('');
    toast.success('Вы вышли из аккаунта');
  };
  
  const handlePublishGame = async () => {
    if (!newGame.title || !newGame.description || !newGame.price) {
      toast.error('Заполните обязательные поля');
      return;
    }
    
    try {
      const response = await fetch(API_URLS.games, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newGame,
          price: parseFloat(newGame.price),
          publisher_username: currentUser?.username
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Игра отправлена на модерацию! Мы свяжемся с вами по электронной почте.');
        setTimeout(() => {
          setShowPublishDialog(false);
          setNewGame({
            title: '',
            description: '',
            price: '',
            developer_email: '',
            genre: '',
            age_rating: '',
            file_url: '',
            logo_url: ''
          });
        }, 3000);
      } else {
        toast.error('Ошибка при публикации игры');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    }
  };
  
  const handleUpdateProfile = async () => {
    if (!currentUser) return;
    
    try {
      const response = await fetch(API_URLS.users, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          action: 'update_profile',
          ...editProfile
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.user) {
        setCurrentUser(data.user);
        setShowEditProfile(false);
        toast.success('Профиль обновлен!');
      } else {
        toast.error('Ошибка при обновлении профиля');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    }
  };
  
  const handleAdminAction = async (userId: number, action: string) => {
    try {
      const response = await fetch(API_URLS.users, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, action })
      });
      
      if (response.ok) {
        loadAllUsers();
        const actionText = action === 'admin_verify' ? 'Пользователь верифицирован' :
                          action === 'admin_unverify' ? 'Верификация снята' :
                          action === 'admin_ban' ? 'Пользователь заблокирован' :
                          'Пользователь разблокирован';
        toast.success(actionText);
      }
    } catch (error) {
      toast.error('Ошибка при выполнении действия');
    }
  };
  
  const handleApproveGame = async (gameId: number, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(API_URLS.games, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId, action })
      });
      
      if (response.ok) {
        loadPendingGames();
        loadGames();
        toast.success(action === 'approve' ? 'Игра одобрена!' : 'Игра отклонена');
      }
    } catch (error) {
      toast.error('Ошибка при выполнении действия');
    }
  };
  
  const viewUserProfile = async (userId: number) => {
    try {
      const response = await fetch(`${API_URLS.users}?user_id=${userId}`);
      const data = await response.json();
      if (response.ok && data.user) {
        setViewingUser(data.user);
        setCurrentView('user-profile');
      }
    } catch (error) {
      toast.error('Ошибка при загрузке профиля');
    }
  };
  
  const handleCreateFrame = async (name: string, price: string, imageUrl: string) => {
    try {
      const response = await fetch(API_URLS.frames, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', name, price: parseFloat(price), image_url: imageUrl })
      });
      
      if (response.ok) {
        loadAllFrames();
        setShowCreateFrame(false);
        toast.success('Рамка создана!');
      }
    } catch (error) {
      toast.error('Ошибка создания рамки');
    }
  };
  
  const handleSetActiveFrame = async (frameId: number) => {
    if (!currentUser) return;
    try {
      const response = await fetch(API_URLS.frames, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_active', user_id: currentUser.id, frame_id: frameId })
      });
      
      if (response.ok) {
        loadUserFrames();
        toast.success('Рамка установлена!');
      }
    } catch (error) {
      toast.error('Ошибка установки рамки');
    }
  };
  
  const handleBuyFrame = async (frameId: number, price: number) => {
    if (!currentUser) return;
    
    if (currentUser.balance < price) {
      toast.error('Недостаточно средств на балансе');
      return;
    }
    
    try {
      const response = await fetch(API_URLS.frames, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'buy', user_id: currentUser.id, frame_id: frameId })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        loadUserFrames();
        const userResponse = await fetch(`${API_URLS.users}?user_id=${currentUser.id}`);
        const userData = await userResponse.json();
        if (userData.user) setCurrentUser(userData.user);
        toast.success('Рамка куплена!');
      } else {
        toast.error(data.error || 'Ошибка покупки');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    }
  };
  
  const handleSellItem = async (itemType: 'game' | 'frame', itemId: number, price: number) => {
    if (!currentUser) return;
    
    try {
      const response = await fetch(API_URLS.marketplace, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'sell', 
          seller_id: currentUser.id, 
          item_type: itemType,
          item_id: itemId,
          price: price
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        loadMarketItems();
        setShowSellDialog(false);
        toast.success('Товар выставлен на продажу!');
      } else {
        toast.error(data.error || 'Ошибка выставления товара');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    }
  };
  
  const handleCancelSale = async (itemId: number) => {
    if (!currentUser) return;
    
    try {
      const response = await fetch(API_URLS.marketplace, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId, seller_id: currentUser.id })
      });
      
      if (response.ok) {
        loadMarketItems();
        toast.success('Продажа отменена!');
      } else {
        toast.error('Ошибка отмены продажи');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    }
  };
  
  const handleBuyMarketItem = async (itemId: number) => {
    if (!currentUser) return;
    try {
      const response = await fetch(API_URLS.marketplace, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'buy', item_id: itemId, buyer_id: currentUser.id })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        loadMarketItems();
        const userResponse = await fetch(`${API_URLS.users}?user_id=${currentUser.id}`);
        const userData = await userResponse.json();
        if (userData.user) setCurrentUser(userData.user);
        toast.success(data.message || 'Покупка успешна!');
      } else {
        toast.error(data.error || 'Ошибка покупки');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    }
  };
  
  const handleUpdateBalance = async () => {
    if (!selectedUserId || !newBalance) return;
    try {
      const response = await fetch(API_URLS.users, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: selectedUserId, action: 'update_balance', balance: parseFloat(newBalance) })
      });
      
      if (response.ok) {
        loadAllUsers();
        
        // Синхронизируем баланс с текущим пользователем если это он
        if (currentUser && currentUser.id === selectedUserId) {
          const userResponse = await fetch(`${API_URLS.users}?user_id=${selectedUserId}`);
          const userData = await userResponse.json();
          if (userData.user) setCurrentUser(userData.user);
        }
        
        setSelectedUserId(null);
        setNewBalance('');
        toast.success('Баланс обновлен!');
      }
    } catch (error) {
      toast.error('Ошибка обновления баланса');
    }
  };
  
  const handleToggleFeatured = async (gameId: number, isFeatured: boolean) => {
    try {
      const response = await fetch(API_URLS.games, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId, action: 'set_featured', is_featured: !isFeatured })
      });
      
      if (response.ok) {
        loadGames();
        loadFeaturedGames();
        toast.success(isFeatured ? 'Игра убрана из популярных' : 'Игра добавлена в популярные!');
      }
    } catch (error) {
      toast.error('Ошибка при обновлении');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">FTeam Store</CardTitle>
            <CardDescription>Платформа для Android игр</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'register')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Пароль</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <Button onClick={handleAuth} className="w-full">
                  Войти
                </Button>
              </TabsContent>
              <TabsContent value="register" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Логин</label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Пароль</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <Button onClick={handleAuth} className="w-full">
                  Зарегистрироваться
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-primary">FTeam</h1>
            <nav className="flex gap-2 md:gap-4 flex-wrap">
              <Button
                variant={currentView === 'featured' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('featured')}
                className="gap-1 md:gap-2 text-xs md:text-sm"
                size="sm"
              >
                <Icon name="Star" size={16} />
                <span className="hidden md:inline">Популярное</span>
              </Button>
              <Button
                variant={currentView === 'store' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('store')}
                className="gap-1 md:gap-2 text-xs md:text-sm"
                size="sm"
              >
                <Icon name="Store" size={16} />
                <span className="hidden md:inline">Магазин</span>
              </Button>
              <Button
                variant={currentView === 'market' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('market')}
                className="gap-1 md:gap-2 text-xs md:text-sm"
                size="sm"
              >
                <Icon name="ShoppingBag" size={16} />
                <span className="hidden md:inline">Площадка</span>
              </Button>
              <Button
                variant={currentView === 'inventory' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('inventory')}
                className="gap-1 md:gap-2 text-xs md:text-sm"
                size="sm"
              >
                <Icon name="Package" size={16} />
                <span className="hidden md:inline">Инвентарь</span>
              </Button>
              <Button
                variant={currentView === 'frames-shop' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('frames-shop')}
                className="gap-1 md:gap-2 text-xs md:text-sm"
                size="sm"
              >
                <Icon name="Frame" size={16} />
                <span className="hidden md:inline">Магазин рамок</span>
              </Button>
              {currentUser.role === 'admin' && (
                <Button
                  variant={currentView === 'admin' ? 'default' : 'ghost'}
                  onClick={() => setCurrentView('admin')}
                  className="gap-1 md:gap-2 text-xs md:text-sm"
                  size="sm"
                >
                  <Icon name="Shield" size={16} />
                  <span className="hidden md:inline">Админ</span>
                </Button>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded">
              <Icon name="Wallet" size={16} />
              <span className="font-medium">{currentUser.balance} ₽</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-5 w-5 p-0"
                onClick={() => window.open('https://t.me/HE_CMOTPI_CYDA_EBANAT', '_blank')}
              >
                <Icon name="Plus" size={14} />
              </Button>
            </div>
            <Button
              variant="ghost"
              onClick={() => setCurrentView('profile')}
              className="gap-2"
            >
              <FramedAvatar
                avatarUrl={currentUser.avatar_url}
                frameUrl={activeFrame || undefined}
                username={currentUser.username}
                size={32}
              />
              <span className="hidden md:inline">{currentUser.username}</span>
              {currentUser.is_verified && (
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
                  ✓
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {currentView === 'store' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Магазин игр</h2>
              <Button className="gap-2" onClick={() => setShowPublishDialog(true)}>
                <Icon name="Upload" size={18} />
                Опубликовать игру
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => (
                <Card key={game.id} className="overflow-hidden hover:border-primary transition-colors">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <Icon name="Gamepad2" size={48} className="text-muted-foreground" />
                  </div>
                  <CardHeader>
                    <CardTitle>{game.title}</CardTitle>
                    <CardDescription>{game.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">{game.price} ₽</span>
                    <Button>Купить</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {currentView === 'library' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Моя библиотека</h2>
            <p className="text-muted-foreground">У вас пока нет игр</p>
          </div>
        )}

        {currentView === 'friends' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Друзья</h2>
            <Tabs defaultValue="list">
              <TabsList>
                <TabsTrigger value="list">Мои друзья</TabsTrigger>
                <TabsTrigger value="search">Поиск друзей</TabsTrigger>
              </TabsList>
              <TabsContent value="list" className="mt-6">
                <p className="text-muted-foreground">У вас пока нет друзей</p>
              </TabsContent>
              <TabsContent value="search" className="mt-6">
                <Input placeholder="Поиск пользователей..." className="max-w-md" />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {currentView === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Профиль</h2>
            <Card className="max-w-2xl">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={currentUser.avatar_url} />
                    <AvatarFallback className="text-2xl">
                      {currentUser.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {currentUser.display_name}
                      {currentUser.is_verified && (
                        <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
                          ✓ Верифицирован
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>@{currentUser.username}</CardDescription>
                  </div>
                  <Button onClick={() => {
                    setEditProfile({
                      display_name: currentUser.display_name,
                      username: currentUser.username,
                      avatar_url: currentUser.avatar_url || ''
                    });
                    setShowEditProfile(true);
                  }}>
                    <Icon name="Edit" size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{currentUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Баланс</p>
                    <p className="font-medium">{currentUser.balance} ₽</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Роль</p>
                    <p className="font-medium">{currentUser.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Время на сайте</p>
                    <p className="font-medium">{currentUser.hours_online || 0} часов</p>
                  </div>
                </div>
                <Button variant="destructive" onClick={handleLogout} className="w-full">
                  Выйти из аккаунта
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
        
        {currentView === 'featured' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Популярные игры</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredGames.map((game) => (
                <Card key={game.id} className="overflow-hidden hover:border-primary transition-colors">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <Icon name="Star" size={48} className="text-primary" />
                  </div>
                  <CardHeader>
                    <CardTitle>{game.title}</CardTitle>
                    <CardDescription>{game.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">{game.price} ₽</span>
                    <Button>Купить</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {currentView === 'market' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Торговая площадка</h2>
            <Tabs defaultValue="buy">
              <TabsList>
                <TabsTrigger value="buy">Купить</TabsTrigger>
                <TabsTrigger value="sell">Продать</TabsTrigger>
              </TabsList>
              <TabsContent value="buy" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {marketItems.map((item) => (
                    <Card key={item.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Icon name={item.item_type === 'game' ? 'Gamepad2' : 'Frame'} size={20} />
                          {item.item_name}
                        </CardTitle>
                        <CardDescription>Продавец: @{item.seller_username}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-primary">{item.price} ₽</span>
                          <Button size="sm" onClick={() => handleBuyMarketItem(item.id)}>
                            Купить
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="sell" className="mt-6">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">Мои товары на продаже</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {marketItems
                      .filter(item => item.seller_id === currentUser?.id)
                      .map((item) => (
                        <Card key={item.id}>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Icon name={item.item_type === 'game' ? 'Gamepad2' : 'Frame'} size={20} />
                              {item.item_name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between items-center">
                              <span className="text-xl font-bold text-primary">{item.price} ₽</span>
                              <Button size="sm" variant="destructive" onClick={() => handleCancelSale(item.id)}>
                                Отменить
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                  
                  <Button onClick={() => setShowSellDialog(true)} className="w-full">
                    <Icon name="Plus" size={20} className="mr-2" />
                    Выставить товар на продажу
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        {currentView === 'inventory' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Инвентарь рамок</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {userFrames.map((frame) => (
                <Card key={frame.id} className={frame.is_active ? 'border-primary' : ''}>
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded flex items-center justify-center mb-2">
                      <img src={frame.image_url} alt={frame.name} className="w-full h-full object-contain" />
                    </div>
                    <p className="text-sm font-medium text-center mb-2">{frame.name}</p>
                    <Button
                      size="sm"
                      className="w-full"
                      variant={frame.is_active ? 'secondary' : 'default'}
                      onClick={() => handleSetActiveFrame(frame.id)}
                    >
                      {frame.is_active ? 'Активна' : 'Установить'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {currentView === 'frames-shop' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Магазин рамок</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {allFrames.map((frame) => {
                const isOwned = userFrames.some(uf => uf.id === frame.id);
                return (
                  <Card key={frame.id}>
                    <CardContent className="p-4">
                      <div className="aspect-square bg-muted rounded flex items-center justify-center mb-2">
                        <img src={frame.image_url} alt={frame.name} className="w-full h-full object-contain" />
                      </div>
                      <p className="text-sm font-medium text-center mb-2">{frame.name}</p>
                      <p className="text-center text-primary font-bold mb-2">{frame.price} ₽</p>
                      {isOwned ? (
                        <Button size="sm" className="w-full" variant="secondary" disabled>
                          Куплено
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          className="w-full" 
                          onClick={() => handleBuyFrame(frame.id, frame.price)}
                        >
                          Купить
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
        
        {currentView === 'user-profile' && viewingUser && (
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => setCurrentView('admin')} className="gap-2">
              <Icon name="ArrowLeft" size={16} />
              Назад
            </Button>
            <h2 className="text-3xl font-bold">Профиль пользователя</h2>
            <Card className="max-w-2xl">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={viewingUser.avatar_url} />
                    <AvatarFallback className="text-2xl">
                      {viewingUser.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {viewingUser.display_name}
                      {viewingUser.is_verified && (
                        <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
                          ✓ Верифицирован
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>@{viewingUser.username}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Роль</p>
                    <p className="font-medium">{viewingUser.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Время на сайте</p>
                    <p className="font-medium">{viewingUser.hours_online || 0} часов</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Библиотека игр</h3>
                  <p className="text-muted-foreground">Список купленных игр пользователя</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Купленные рамки</h3>
                  <p className="text-muted-foreground">Коллекция рамок пользователя</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === 'admin' && currentUser.role === 'admin' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Админ панель</h2>
            <Tabs defaultValue="users">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="users">Пользователи</TabsTrigger>
                <TabsTrigger value="games">Заявки</TabsTrigger>
                <TabsTrigger value="all-games">Все игры</TabsTrigger>
                <TabsTrigger value="frames">Рамки</TabsTrigger>
              </TabsList>
              <TabsContent value="users" className="mt-6 space-y-4">
                <Input 
                  placeholder="Поиск по имени пользователя..." 
                  className="max-w-md"
                  value={searchUsers}
                  onChange={(e) => setSearchUsers(e.target.value)}
                />
                <div className="space-y-2">
                  {allUsers
                    .filter(u => searchUsers ? u.username.toLowerCase().includes(searchUsers.toLowerCase()) : true)
                    .map((user) => (
                    <Card key={user.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium flex items-center gap-2">
                                {user.display_name}
                                {user.is_verified && (
                                  <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
                                    ✓
                                  </Badge>
                                )}
                                {user.role === 'admin' && (
                                  <Badge variant="outline">Админ</Badge>
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground">@{user.username} • {user.email}</p>
                              <p className="text-sm text-muted-foreground">Баланс: {user.balance} ₽</p>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <Button size="sm" variant="outline" onClick={() => viewUserProfile(user.id)}>
                              <Icon name="Eye" size={16} />
                            </Button>
                            {user.is_verified ? (
                              <Button size="sm" variant="outline" onClick={() => handleAdminAction(user.id, 'admin_unverify')}>
                                Снять галочку
                              </Button>
                            ) : (
                              <Button size="sm" onClick={() => handleAdminAction(user.id, 'admin_verify')}>
                                Выдать галочку
                              </Button>
                            )}
                            {user.is_banned ? (
                              <Button size="sm" variant="outline" onClick={() => handleAdminAction(user.id, 'admin_unban')}>
                                Разбанить
                              </Button>
                            ) : (
                              <Button size="sm" variant="destructive" onClick={() => handleAdminAction(user.id, 'admin_ban')}>
                                Забанить
                              </Button>
                            )}
                            <Button size="sm" variant="secondary" onClick={() => {
                              setSelectedUserId(user.id);
                              setNewBalance(user.balance.toString());
                            }}>
                              Баланс
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="games" className="mt-6 space-y-4">
                {pendingGames.length === 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Заявки на публикацию</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">Нет заявок на модерацию</p>
                    </CardContent>
                  </Card>
                ) : (
                  pendingGames.map((game) => (
                    <Card key={game.id}>
                      <CardHeader>
                        <CardTitle>{game.title}</CardTitle>
                        <CardDescription>От: {game.publisher_username}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Жанр</p>
                            <p className="font-medium">{game.genre || 'Не указан'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Возраст</p>
                            <p className="font-medium">{game.age_rating || 'Не указан'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Цена</p>
                            <p className="font-medium">{game.price} ₽</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Email разработчика</p>
                            <p className="font-medium">{game.developer_email || 'Не указан'}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Описание</p>
                          <p>{game.description}</p>
                        </div>
                        {game.file_url && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Файл игры</p>
                            <a href={game.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {game.file_url}
                            </a>
                          </div>
                        )}
                        {game.logo_url && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Логотип</p>
                            <a href={game.logo_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {game.logo_url}
                            </a>
                          </div>
                        )}
                        <div className="flex gap-2 flex-wrap">
                          <Button onClick={() => handleApproveGame(game.id, 'approve')}>
                            Одобрить
                          </Button>
                          <Button variant="destructive" onClick={() => handleApproveGame(game.id, 'reject')}>
                            Отклонить
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
              <TabsContent value="frames" className="mt-6">
                <div className="space-y-4">
                  <Button className="gap-2" onClick={() => setShowCreateFrame(true)}>
                    <Icon name="Plus" size={18} />
                    Создать рамку
                  </Button>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {allFrames.map((frame) => (
                      <Card key={frame.id}>
                        <CardContent className="p-4">
                          <div className="aspect-square bg-muted rounded flex items-center justify-center mb-2">
                            <img src={frame.image_url} alt={frame.name} className="w-full h-full object-contain" />
                          </div>
                          <p className="text-sm font-medium text-center">{frame.name}</p>
                          <p className="text-sm text-muted-foreground text-center">{frame.price} ₽</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="all-games" className="mt-6 space-y-4">
                {games.map((game) => (
                  <Card key={game.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>{game.title}</CardTitle>
                        <Button
                          size="sm"
                          variant={game.is_featured ? 'secondary' : 'default'}
                          onClick={() => handleToggleFeatured(game.id, game.is_featured || false)}
                        >
                          {game.is_featured ? 'Убрать из популярных' : 'В популярное'}
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
      
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Опубликовать игру</DialogTitle>
            <DialogDescription>Заполните анкету для публикации игры в FTeam</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Название игры *</label>
              <Input
                value={newGame.title}
                onChange={(e) => setNewGame({...newGame, title: e.target.value})}
                placeholder="Название вашей игры"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Описание *</label>
              <Textarea
                value={newGame.description}
                onChange={(e) => setNewGame({...newGame, description: e.target.value})}
                placeholder="Опишите вашу игру"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Цена (₽) *</label>
                <Input
                  type="number"
                  value={newGame.price}
                  onChange={(e) => setNewGame({...newGame, price: e.target.value})}
                  placeholder="199"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Жанр</label>
                <Input
                  value={newGame.genre}
                  onChange={(e) => setNewGame({...newGame, genre: e.target.value})}
                  placeholder="Экшен, Головоломка..."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Возрастное ограничение</label>
                <Input
                  value={newGame.age_rating}
                  onChange={(e) => setNewGame({...newGame, age_rating: e.target.value})}
                  placeholder="0+, 12+, 18+..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email для связи</label>
                <Input
                  type="email"
                  value={newGame.developer_email}
                  onChange={(e) => setNewGame({...newGame, developer_email: e.target.value})}
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL файла игры</label>
              <Input
                value={newGame.file_url}
                onChange={(e) => setNewGame({...newGame, file_url: e.target.value})}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL логотипа</label>
              <Input
                value={newGame.logo_url}
                onChange={(e) => setNewGame({...newGame, logo_url: e.target.value})}
                placeholder="https://..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePublishGame} className="flex-1">
                Опубликовать игру
              </Button>
              <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать профиль</DialogTitle>
            <DialogDescription>Измените информацию о себе</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Имя пользователя</label>
              <Input
                value={editProfile.username}
                onChange={(e) => setEditProfile({...editProfile, username: e.target.value})}
                placeholder="username"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Отображаемое имя</label>
              <Input
                value={editProfile.display_name}
                onChange={(e) => setEditProfile({...editProfile, display_name: e.target.value})}
                placeholder="Ваше имя"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL аватара</label>
              <Input
                value={editProfile.avatar_url}
                onChange={(e) => setEditProfile({...editProfile, avatar_url: e.target.value})}
                placeholder="https://..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateProfile} className="flex-1">
                Сохранить
              </Button>
              <Button variant="outline" onClick={() => setShowEditProfile(false)}>
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showCreateFrame} onOpenChange={setShowCreateFrame}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать рамку</DialogTitle>
            <DialogDescription>Добавьте новую рамку в магазин</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Название</label>
              <Input
                id="frame-name"
                placeholder="Золотая рамка"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Цена (₽)</label>
              <Input
                id="frame-price"
                type="number"
                placeholder="99"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL изображения (PNG/GIF)</label>
              <Input
                id="frame-image"
                placeholder="https://..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => {
                const name = (document.getElementById('frame-name') as HTMLInputElement).value;
                const price = (document.getElementById('frame-price') as HTMLInputElement).value;
                const image = (document.getElementById('frame-image') as HTMLInputElement).value;
                handleCreateFrame(name, price, image);
              }} className="flex-1">
                Создать
              </Button>
              <Button variant="outline" onClick={() => setShowCreateFrame(false)}>
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showSellDialog} onOpenChange={setShowSellDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Выставить товар на продажу</DialogTitle>
            <DialogDescription>Выберите что продать из библиотеки или инвентаря</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Tabs defaultValue="games">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="games">Игры</TabsTrigger>
                <TabsTrigger value="frames">Рамки</TabsTrigger>
              </TabsList>
              <TabsContent value="games" className="space-y-4 mt-4">
                {games.filter(g => currentUser?.ownedGames?.includes(g.id)).map(game => (
                  <Card key={game.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Icon name="Gamepad2" size={24} />
                          <span className="font-medium">{game.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            id={`sell-game-${game.id}`}
                            type="number"
                            placeholder="Цена"
                            className="w-24"
                          />
                          <Button size="sm" onClick={() => {
                            const priceInput = document.getElementById(`sell-game-${game.id}`) as HTMLInputElement;
                            const price = parseFloat(priceInput.value);
                            if (price > 0) {
                              handleSellItem('game', game.id, price);
                            } else {
                              toast.error('Укажите цену');
                            }
                          }}>
                            Продать
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              <TabsContent value="frames" className="space-y-4 mt-4">
                {userFrames.filter(f => !f.is_active).map(frame => (
                  <Card key={frame.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Icon name="Frame" size={24} />
                          <span className="font-medium">{frame.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            id={`sell-frame-${frame.id}`}
                            type="number"
                            placeholder="Цена"
                            className="w-24"
                          />
                          <Button size="sm" onClick={() => {
                            const priceInput = document.getElementById(`sell-frame-${frame.id}`) as HTMLInputElement;
                            const price = parseFloat(priceInput.value);
                            if (price > 0) {
                              handleSellItem('frame', frame.id, price);
                            } else {
                              toast.error('Укажите цену');
                            }
                          }}>
                            Продать
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!selectedUserId} onOpenChange={(open) => !open && setSelectedUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить баланс пользователя</DialogTitle>
            <DialogDescription>Установите новый баланс</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Новый баланс (₽)</label>
              <Input
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                placeholder="1000"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateBalance} className="flex-1">
                Сохранить
              </Button>
              <Button variant="outline" onClick={() => setSelectedUserId(null)}>
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}