
import React, { useEffect, useState } from 'react';
import { ExternalLink, RefreshCw, Flame, Clock } from 'lucide-react';

interface RedditPost {
  title: string;
  url: string;
  author: string;
  score: number;
  type: 'hot' | 'new';
  created: number;
}

interface NewsFeedProps {
  headerAction?: React.ReactNode;
}

export const NewsFeed: React.FC<NewsFeedProps> = () => {
  const [news, setNews] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReddit = async () => {
    setLoading(true);
    try {
      const [hotRes, newRes] = await Promise.all([
        fetch('https://www.reddit.com/r/news/hot.json?limit=10'),
        fetch('https://www.reddit.com/r/news/new.json?limit=10')
      ]);
      
      const hotData = await hotRes.json();
      const newData = await newRes.json();

      const hotPosts: RedditPost[] = hotData.data.children.map((child: any) => ({
        title: child.data.title,
        url: `https://reddit.com${child.data.permalink}`,
        author: child.data.author,
        score: child.data.score,
        type: 'hot',
        created: child.data.created_utc
      }));

      const newPosts: RedditPost[] = newData.data.children.map((child: any) => ({
        title: child.data.title,
        url: `https://reddit.com${child.data.permalink}`,
        author: child.data.author,
        score: child.data.score,
        type: 'new',
        created: child.data.created_utc
      }));

      const postMap = new Map<string, RedditPost>();
      
      [...hotPosts, ...newPosts].forEach(post => {
        if (!postMap.has(post.url)) {
          postMap.set(post.url, post);
        }
      });
      
      const uniquePosts = Array.from(postMap.values());
      const sorted = uniquePosts.sort((a, b) => b.created - a.created);
      
      setNews(sorted.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch reddit news", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReddit();
  }, []);

  // Define the refresh button to be rendered in the parent BentoCard's header
  const headerAction = (
    <button 
      onClick={fetchReddit} 
      className="text-slate-400 hover:text-blue-500 transition-colors shrink-0"
      title="Refresh News"
    >
      <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
    </button>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Redundant header removed as requested. Refresh icon passed to parent via headerAction hack in BentoCard */}
      <ul className="space-y-4 overflow-y-auto no-scrollbar pb-4 flex-1">
        {loading ? (
          [1,2,3,4,5].map(i => <li key={i} className="h-12 bg-slate-100/50 animate-pulse rounded"></li>)
        ) : (
          news.map((item, idx) => (
            <li key={idx}>
              <a 
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-1 group/link"
              >
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-inherit opacity-80 group-hover/link:opacity-100 transition-opacity line-clamp-2">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                    {item.type === 'hot' ? <Flame size={10} className="text-orange-500" /> : <Clock size={10} className="text-blue-500" />}
                    <span>{item.type.toUpperCase()}</span>
                    <span>•</span>
                    <span>{item.score} votes</span>
                  </div>
                </div>
              </a>
            </li>
          ))
        )}
      </ul>
      {/* We "attach" headerAction to the component so BentoCard can find it */}
      {(NewsFeed as any).headerAction = headerAction}
    </div>
  );
};
