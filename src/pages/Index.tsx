import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

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
}

interface Game {
  id: number;
  title: string;
  description: string;
  price: number;
  logo_url: string;
  status: string;
}

export default function Index() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [currentView, setCurrentView] = useState<'store' | 'library' | 'profile' | 'friends' | 'admin'>('store');

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    const sampleGames: Game[] = [
      {
        id: 1,
        title: 'Space Adventure',
        description: 'Исследуйте галактику в этой захватывающей космической игре',
        price: 599,
        logo_url: '/placeholder.svg',
        status: 'approved'
      },
      {
        id: 2,
        title: 'Racing King',
        description: 'Гонки на высокой скорости по городским трассам',
        price: 399,
        logo_url: '/placeholder.svg',
        status: 'approved'
      },
      {
        id: 3,
        title: 'Puzzle Master',
        description: 'Решайте головоломки и тренируйте мозг',
        price: 199,
        logo_url: '/placeholder.svg',
        status: 'approved'
      }
    ];
    setGames(sampleGames);
  };

  const handleAuth = () => {
    if (authMode === 'login') {
      if (email === 'suradaniil74@gmail.com' && password === 'Shura1234321') {
        const adminUser: User = {
          id: 1,
          email: 'suradaniil74@gmail.com',
          username: 'admin',
          display_name: 'Администратор',
          avatar_url: '',
          balance: 10000,
          role: 'admin',
          is_verified: true,
          is_banned: false
        };
        setCurrentUser(adminUser);
        toast.success('Добро пожаловать, Администратор!');
      } else {
        toast.error('Неверный email или пароль');
      }
    } else {
      if (!email || !password || !username) {
        toast.error('Заполните все поля');
        return;
      }
      const newUser: User = {
        id: Date.now(),
        email,
        username,
        display_name: username,
        avatar_url: '',
        balance: 0,
        role: 'user',
        is_verified: false,
        is_banned: false
      };
      setCurrentUser(newUser);
      toast.success('Регистрация успешна!');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('store');
    setEmail('');
    setPassword('');
    setUsername('');
    toast.success('Вы вышли из аккаунта');
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
            <nav className="flex gap-4">
              <Button
                variant={currentView === 'store' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('store')}
                className="gap-2"
              >
                <Icon name="Store" size={18} />
                Магазин
              </Button>
              <Button
                variant={currentView === 'library' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('library')}
                className="gap-2"
              >
                <Icon name="Library" size={18} />
                Библиотека
              </Button>
              <Button
                variant={currentView === 'friends' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('friends')}
                className="gap-2"
              >
                <Icon name="Users" size={18} />
                Друзья
              </Button>
              {currentUser.role === 'admin' && (
                <Button
                  variant={currentView === 'admin' ? 'default' : 'ghost'}
                  onClick={() => setCurrentView('admin')}
                  className="gap-2"
                >
                  <Icon name="Shield" size={18} />
                  Админ панель
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
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatar_url} />
                <AvatarFallback>{currentUser.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <span>{currentUser.username}</span>
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
              <Button className="gap-2">
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
                  <div>
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
                    <p className="font-medium">0 часов</p>
                  </div>
                </div>
                <Button variant="destructive" onClick={handleLogout} className="w-full">
                  Выйти из аккаунта
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === 'admin' && currentUser.role === 'admin' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Админ панель</h2>
            <Tabs defaultValue="users">
              <TabsList>
                <TabsTrigger value="users">Пользователи</TabsTrigger>
                <TabsTrigger value="games">Заявки на игры</TabsTrigger>
                <TabsTrigger value="frames">Рамки</TabsTrigger>
              </TabsList>
              <TabsContent value="users" className="mt-6 space-y-4">
                <Input placeholder="Поиск по имени пользователя..." className="max-w-md" />
                <Card>
                  <CardHeader>
                    <CardTitle>Список пользователей</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Пользователи будут отображаться здесь</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="games" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Заявки на публикацию</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Заявки будут отображаться здесь</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="frames" className="mt-6">
                <div className="space-y-4">
                  <Button className="gap-2">
                    <Icon name="Plus" size={18} />
                    Создать рамку
                  </Button>
                  <Card>
                    <CardHeader>
                      <CardTitle>Магазин рамок</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">Рамки будут отображаться здесь</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}