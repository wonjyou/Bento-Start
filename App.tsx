
import React, { useState, useEffect, useRef } from 'react';
import { BentoCardData, UserSettings, CardType } from './types';
import { INITIAL_CARDS } from './constants';
import { BentoCard } from './components/BentoCard';
import { Greeting } from './components/widgets/Greeting';
import { Search } from './components/widgets/Search';
import { NewsFeed } from './components/widgets/NewsFeed';
import { Directions } from './components/widgets/Directions';
import { LinkList } from './components/widgets/LinkList';
import { Weather } from './components/widgets/Weather';
import { 
  Settings as SettingsIcon, LayoutGrid, Plus, Save, Undo2, 
  Calendar, MapPin, User, CheckCircle2, Clock, ShieldCheck, 
  ShieldAlert, Sun, Cloud, CloudRain, Snowflake, CloudCheck, Loader2,
  ChevronDown, Paintbrush, Cog
} from 'lucide-react';
import { format } from 'date-fns';
import { getWeatherInfo } from './services/geminiService';
import { dbService } from './services/dbService';

const App: React.FC = () => {
  const [cards, setCards] = useState<BentoCardData[]>([]);
  const [user, setUser] = useState<UserSettings>({ 
    userName: 'Won', 
    userAddress: '', 
    isDarkMode: false,
    calendarConnected: false,
    recentSearches: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weatherData, setWeatherData] = useState<{ temp: number; condition: string } | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  
  const menuRef = useRef<HTMLDivElement>(null);

  // Drag and Drop States
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Database Initialization
  useEffect(() => {
    const initApp = async () => {
      await dbService.init();
      const savedCards = await dbService.getCards();
      const savedUser = await dbService.getSettings();

      if (savedCards && savedCards.length > 0) {
        setCards(savedCards.sort((a, b) => a.order - b.order));
      } else {
        const legacyCards = localStorage.getItem('bento_cards');
        setCards(legacyCards ? JSON.parse(legacyCards) : INITIAL_CARDS);
      }

      if (savedUser) {
        setUser(savedUser);
      } else {
        const legacyUser = localStorage.getItem('bento_user');
        if (legacyUser) setUser(JSON.parse(legacyUser));
      }
      
      setInitialized(true);
    };

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    initApp();
    return () => clearInterval(timer);
  }, []);

  // Weather and Persistence Logic
  useEffect(() => {
    if (initialized) {
      const sync = async () => {
        setSyncStatus('syncing');
        try {
          await dbService.saveSettings(user);
          await dbService.saveCards(cards);
          
          if (user.userAddress && user.userAddress.trim()) {
            const data = await getWeatherInfo(user.userAddress);
            setWeatherData({ temp: data.temp, condition: data.condition });
          } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
              const data = await getWeatherInfo('', { lat: pos.coords.latitude, lng: pos.coords.longitude });
              setWeatherData({ temp: data.temp, condition: data.condition });
            }, (err) => {
              getWeatherInfo('San Francisco').then(data => {
                setWeatherData({ temp: data.temp, condition: data.condition });
              });
            });
          }
          
          setSyncStatus('synced');
          setTimeout(() => setSyncStatus('idle'), 2000);
        } catch (e) {
          console.error("Database sync failed", e);
          setSyncStatus('idle');
        }
      };
      
      const timeout = setTimeout(sync, 1000);
      return () => clearTimeout(timeout);
    }
  }, [cards, user, initialized]);

  const updateCard = (id: string, updates: Partial<BentoCardData>) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  };

  const addCard = (type: CardType) => {
    const newCard: BentoCardData = {
      id: `card-${Date.now()}`,
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      size: 'small',
      theme: 'default',
      order: cards.length,
      links: type === 'links' ? [] : undefined,
    };
    setCards([...cards, newCard]);
  };

  const handleSearchPerformed = (query: string) => {
    setUser(prev => {
      const newRecents = [query, ...prev.recentSearches.filter(q => q !== query)].slice(0, 10);
      return { ...prev, recentSearches: newRecents };
    });
  };

  const handleClearRecent = (query: string) => {
    setUser(prev => ({
      ...prev,
      recentSearches: prev.recentSearches.filter(q => q !== query)
    }));
  };

  const toggleCalendarAccess = () => {
    setUser(prev => ({ ...prev, calendarConnected: !prev.calendarConnected }));
  };

  const resetLayout = () => {
    if (confirm('Reset to default layout? This will clear your database settings.')) {
      setCards(INITIAL_CARDS);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('cardId', id);
    setDraggedCardId(id);
    setTimeout(() => setDraggedCardId(id), 0);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedCardId !== id) setDragOverCardId(id);
  };

  const handleDragEnd = () => {
    setDraggedCardId(null);
    setDragOverCardId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('cardId');
    if (!draggedId || draggedId === targetId) return;

    setCards(prev => {
      const items = [...prev].sort((a, b) => a.order - b.order);
      const draggedIdx = items.findIndex(i => i.id === draggedId);
      const targetIdx = items.findIndex(i => i.id === targetId);

      if (draggedIdx === -1 || targetIdx === -1) return prev;

      const [movedItem] = items.splice(draggedIdx, 1);
      items.splice(targetIdx, 0, movedItem);

      return items.map((item, index) => ({ ...item, order: index }));
    });

    setDraggedCardId(null);
    setDragOverCardId(null);
  };

  const renderWidget = (card: BentoCardData) => {
    switch (card.type) {
      case 'greeting': return <Greeting userName={user.userName} calendarConnected={user.calendarConnected} />;
      case 'search': return <Search recentSearches={user.recentSearches} onSearch={handleSearchPerformed} onClearRecent={handleClearRecent} />;
      case 'news': return <NewsFeed />;
      case 'directions': return <Directions userAddress={user.userAddress} onOpenSettings={() => setShowSettings(true)} />;
      case 'weather': return <Weather location={user.userAddress} />;
      case 'links': return <LinkList theme={card.theme} links={card.links || []} isEditing={isEditing} onUpdate={(links) => updateCard(card.id, { links })} />;
      default: return null;
    }
  };

  const getGreetingText = () => {
    const hours = currentTime.getHours();
    let prefix = "Morning";
    if (hours >= 12 && hours < 17) prefix = "Afternoon";
    if (hours >= 17) prefix = "Evening";
    return `${prefix}, ${user.userName}`;
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return <Sun className="text-orange-400" size={16} />;
      case 'cloudy': return <Cloud className="text-slate-400" size={16} />;
      case 'rainy': return <CloudRain className="text-blue-400" size={16} />;
      case 'snowy': return <Snowflake className="text-blue-200" size={16} />;
      default: return <Sun className="text-orange-400" size={16} />;
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 px-6 sm:px-10 lg:px-20 max-w-[1600px] mx-auto bg-[#f9fafb] text-slate-900 overflow-hidden flex flex-col">
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">Preferences</h2>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><Plus size={24} className="rotate-45" /></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2"><User size={12} /> Display Name</label>
                <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400 transition-all" value={user.userName} onChange={(e) => setUser({ ...user, userName: e.target.value })} placeholder="What's your name?" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2"><MapPin size={12} /> Home Address / City</label>
                <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400 transition-all" value={user.userAddress} onChange={(e) => setUser({ ...user, userAddress: e.target.value })} placeholder="e.g. San Francisco, CA" />
              </div>
              <div className="pt-4 border-t border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">Integrations</label>
                <button onClick={toggleCalendarAccess} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${user.calendarConnected ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  <div className="flex items-center gap-3">
                    <Calendar size={18} /><div className="text-left"><div className="text-xs font-bold">Google Calendar</div><div className="text-[10px] opacity-70">{user.calendarConnected ? 'Access Granted' : 'Request Access'}</div></div>
                  </div>
                  {user.calendarConnected ? <ShieldCheck size={20} /> : <ShieldAlert size={20} className="text-slate-300" />}
                </button>
              </div>
            </div>
            <button onClick={() => setShowSettings(false)} className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-all"><CheckCircle2 size={18} /> Save Settings</button>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center py-10 gap-6 shrink-0">
        <div className="flex items-center gap-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2 group cursor-default"><LayoutGrid className="text-blue-500 group-hover:rotate-90 transition-transform duration-500 shrink-0" />{getGreetingText()}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Your Daily Dashboard</p>
              <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-slate-200">
                {syncStatus === 'syncing' ? <Loader2 size={10} className="animate-spin text-blue-400" /> : <CloudCheck size={10} className={syncStatus === 'synced' ? 'text-emerald-500' : 'text-slate-200'} />}
                <span className={`text-[8px] font-bold uppercase tracking-tighter ${syncStatus === 'synced' ? 'text-emerald-500' : 'text-slate-300'}`}>{syncStatus === 'syncing' ? 'Syncing...' : 'Synced'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white border border-slate-200 py-2.5 px-5 rounded-2xl shadow-sm">
             <div className="flex items-center gap-2 pr-4 border-r border-slate-100"><Clock size={16} className="text-blue-500" /><span className="text-lg font-bold tabular-nums tracking-tight">{format(currentTime, 'hh:mm a')}</span></div>
             <a href="https://calendar.google.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-blue-500 transition-all group px-4 border-r border-slate-100">
              <div className="text-left"><div className="text-[10px] font-bold text-slate-400 uppercase leading-none">{format(currentTime, 'EEEE')}</div><div className="text-sm font-bold text-slate-700 group-hover:text-blue-500">{format(currentTime, 'MMM dd')}</div></div>
             </a>
             {weatherData && (
                <a href={`https://www.google.com/search?q=weather+${encodeURIComponent(user.userAddress || 'current+weather')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-2 hover:opacity-70 transition-opacity"><div className="flex items-center gap-2">{getWeatherIcon(weatherData.condition)}<span className="text-sm font-bold text-slate-700">{weatherData.temp}°F</span></div></a>
             )}
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {isEditing ? (
            <><div className="flex bg-slate-100 p-1 rounded-xl"><button onClick={() => addCard('links')} className="px-3 py-1.5 text-[10px] font-bold hover:bg-white rounded-lg transition-all uppercase">Links</button><button onClick={() => addCard('search')} className="px-3 py-1.5 text-[10px] font-bold hover:bg-white rounded-lg transition-all uppercase">Search</button><button onClick={() => addCard('news')} className="px-3 py-1.5 text-[10px] font-bold hover:bg-white rounded-lg transition-all uppercase">News</button></div><button onClick={resetLayout} className="p-2 text-slate-400 hover:text-red-500" title="Reset Layout"><Undo2 size={20} /></button><button onClick={() => setIsEditing(false)} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-blue-200 flex items-center gap-2 hover:bg-blue-700 transition-all"><Save size={18} />Save Layout</button></>
          ) : (
            <>
              <button onClick={() => setShowSettings(true)} className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-800 transition-colors font-semibold text-sm border border-slate-100 rounded-xl truncate max-w-[200px]"><MapPin size={16} /><span className="truncate">{user.userAddress || 'Detecting Location...'}</span></button>
              
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setShowMenu(!showMenu)} 
                  className={`p-2.5 rounded-xl border transition-all flex items-center gap-1 shadow-sm ${showMenu ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-800'}`}
                >
                  <SettingsIcon size={20} />
                  <ChevronDown size={14} className={`transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 py-2 overflow-hidden transform origin-top-right transition-all">
                    <button 
                      onClick={() => { setIsEditing(true); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors text-left"
                    >
                      <Paintbrush size={16} className="text-blue-500" />
                      <span>Customize Layout</span>
                    </button>
                    <button 
                      onClick={() => { setShowSettings(true); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors text-left border-t border-slate-50"
                    >
                      <Cog size={16} className="text-slate-400" />
                      <span>Manage Settings</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      <main className="bento-grid flex-1 overflow-y-auto no-scrollbar pb-10">
        {cards.map((card) => (
          <BentoCard key={card.id} card={card} onUpdate={updateCard} onDelete={deleteCard} isEditingGlobal={isEditing} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} onDrop={handleDrop} isDragged={draggedCardId === card.id} isOver={dragOverCardId === card.id}>{renderWidget(card)}</BentoCard>
        ))}
        {isEditing && (
          <button onClick={() => addCard('links')} className="border-2 border-dashed border-slate-200 rounded-2xl h-[140px] flex flex-col items-center justify-center gap-2 text-slate-300 hover:border-blue-400 hover:text-blue-400 transition-all group"><Plus size={32} className="group-hover:scale-110 transition-transform" /><span className="text-xs font-bold uppercase tracking-widest">New Widget</span></button>
        )}
      </main>
    </div>
  );
};

export default App;
