
import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Snowflake, Thermometer, RefreshCw, MapPin } from 'lucide-react';
import { getWeatherInfo } from '../../services/geminiService';

interface WeatherProps {
  location: string;
}

export const Weather: React.FC<WeatherProps> = ({ location }) => {
  const [data, setData] = useState<{ temp: number; condition: string; description: string; locationName?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    setLoading(true);
    const result = await getWeatherInfo(location || 'San Francisco');
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchWeather();
  }, [location]);

  const getIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return <Sun className="text-orange-400" size={32} />;
      case 'cloudy': return <Cloud className="text-slate-400" size={32} />;
      case 'rainy': return <CloudRain className="text-blue-400" size={32} />;
      case 'snowy': return <Snowflake className="text-blue-200" size={32} />;
      default: return <Sun className="text-orange-400" size={32} />;
    }
  };

  if (loading) return <div className="animate-pulse flex items-center justify-center h-full"><RefreshCw className="animate-spin text-slate-300" /></div>;

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-3xl font-bold flex items-center gap-1">
            {data?.temp}°<span className="text-sm font-normal opacity-40">F</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">{data?.condition}</p>
        </div>
        {getIcon(data?.condition || '')}
      </div>
      <div className="mt-4">
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {data?.description}
        </p>
        <div className="flex items-center gap-1 text-[10px] text-slate-300 mt-1">
          <MapPin size={10} />
          <span className="truncate">{data?.locationName || location || 'Set location in settings'}</span>
        </div>
      </div>
    </div>
  );
};
