/**
 * 搜索框组件 - 支持搜索建议和书签搜索模式
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, BookMarked, Pin } from 'lucide-react';
import { SEARCH_ENGINES, FAVICON_API } from '../../constants/index';
import { useNewtabStore } from '../../hooks';
import { useTMarksSync } from '../../hooks/useTMarksSync';
import { SearchEngineSelector } from './SearchEngineSelector';
import { t } from '@/lib/i18n';
import { TIMEOUTS } from '@/lib/constants/timeouts';
import type { SearchEngine, SearchResult } from '../../types';

// 获取 favicon URL，如果没有则使用 Google API
function getFaviconUrl(favicon: string | undefined, url: string): string {
  if (favicon) return favicon;
  try {
    const domain = new URL(url).hostname;
    return `${FAVICON_API}${domain}&sz=64`;
  } catch {
    return '';
  }
}

interface SearchBarProps {
  engine: SearchEngine;
  enableSuggestions?: boolean;
  onEngineChange?: (engine: SearchEngine) => void;
}

export function SearchBar({ engine, enableSuggestions = true, onEngineChange }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [bookmarkMode, setBookmarkMode] = useState(false); // 书签搜索模式
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const { items, addItem, addHomeItem, activeView, activeGroupId } = useNewtabStore();
  const { searchBookmarks, recordBookmarkClick } = useTMarksSync();

  const engineConfig = SEARCH_ENGINES.find((e) => e.id === engine) || SEARCH_ENGINES[0];

  // 搜索本地快捷方式
  const searchShortcuts = useCallback((q: string): SearchResult[] => {
    const lower = q.toLowerCase();
    return items
      .filter((item) => {
        if (item.type !== 'shortcut') return false;
        const data = item.data as { url: string; title: string };
        return data.title.toLowerCase().includes(lower) || data.url.toLowerCase().includes(lower);
      })
      .slice(0, 5)
      .map((item) => {
        const data = item.data as { url: string; title: string; favicon?: string };
        return {
          id: item.id,
          title: data.title,
          url: data.url,
          favicon: data.favicon,
          source: 'shortcut' as const,
        };
      });
  }, [items]);

  // 搜索建议
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    // 防抖 - 优化为 200ms
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (bookmarkMode) {
        // 书签模式：只搜索书签和快捷方式
        const localResults = searchShortcuts(query);
        const remoteResults = await searchBookmarks(query);
        const remoteFormatted: SearchResult[] = remoteResults.map((b) => ({
          id: b.id,
          title: b.title,
          url: b.url,
          favicon: b.favicon,
          source: 'bookmark' as const,
          tags: b.tags,
          description: b.description,
          click_count: b.click_count,
          is_pinned: b.is_pinned,
        }));

        // 合并去重
        const allResults = [...localResults];
        remoteFormatted.forEach((r) => {
          if (!allResults.some((a) => a.url === r.url)) {
            allResults.push(r);
          }
        });

        setSuggestions(allResults.slice(0, 10));
      } else if (enableSuggestions) {
        // 普通模式：搜索本地和远程书签作为建议
        const localResults = searchShortcuts(query);
        const remoteResults = await searchBookmarks(query);
        const remoteFormatted: SearchResult[] = remoteResults.map((b) => ({
          id: b.id,
          title: b.title,
          url: b.url,
          favicon: b.favicon,
          source: 'bookmark' as const,
          tags: b.tags,
          description: b.description,
          click_count: b.click_count,
          is_pinned: b.is_pinned,
        }));

        const allResults = [...localResults];
        remoteFormatted.forEach((r) => {
          if (!allResults.some((a) => a.url === r.url)) {
            allResults.push(r);
          }
        });

        setSuggestions(allResults.slice(0, 8));
      }
    }, TIMEOUTS.SHORT / 1.5);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, searchShortcuts, searchBookmarks, bookmarkMode, enableSuggestions]);

  const handleSearch = useCallback(() => {
    if (!query.trim()) return;
    const url = engineConfig.url + encodeURIComponent(query.trim());
    window.location.href = url;
  }, [query, engineConfig]);

  const handleSelect = (result: SearchResult) => {
    // 如果是书签，记录点击次数
    if (result.source === 'bookmark') {
      recordBookmarkClick(result.id);
    }
    window.location.href = result.url;
  };

  // 固定书签到 NewTab
  const handlePinToNewTab = useCallback(async (e: React.MouseEvent, result: SearchResult) => {
    e.stopPropagation();
    
    // 创建 Item
    if (activeView === 'home') {
      addHomeItem({
        type: 'shortcut',
        parentId: null,
        position: 0,
        data: {
          type: 'shortcut',
          url: result.url,
          title: result.title,
          favicon: result.favicon,
          clickCount: 0,
        },
        serverItemId: result.id,
      });
    } else {
      addItem({
        type: 'shortcut',
        groupId: activeGroupId || '__home__',
        parentId: null,
        position: 0,
        data: {
          type: 'shortcut',
          url: result.url,
          title: result.title,
          favicon: result.favicon,
          clickCount: 0,
        },
        serverItemId: result.id,
      });
    }
    
    // 从建议列表中移除（标记为已固定）
    setSuggestions(prev => prev.map(s => 
      s.id === result.id ? { ...s, is_pinned: true } : s
    ));
  }, [addItem, addHomeItem, activeView, activeGroupId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelect(suggestions[selectedIndex]);
      } else if (!bookmarkMode) {
        // 只有非书签模式才跳转搜索引擎
        handleSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setSelectedIndex(-1);
    }
  };

  // 书签模式下始终显示结果，普通模式需要开启建议
  const showSuggestions = (bookmarkMode || enableSuggestions) && isFocused && suggestions.length > 0;

  return (
    <div className="relative">
      <div
        className={`
          flex items-center gap-3 px-4 py-3 rounded-full
          glass transition-all duration-200
          ${isFocused ? 'ring-2 ring-white/30 bg-white/15' : 'hover:bg-white/15'}
        `}
      >
        {onEngineChange ? (
          <SearchEngineSelector current={engine} onChange={onEngineChange} />
        ) : (
          <Search className="w-5 h-5 text-white/60 flex-shrink-0" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), TIMEOUTS.ANIMATION)}
          placeholder={bookmarkMode ? t('search_bookmark_placeholder') : t('search_engine_placeholder', engineConfig.name)}
          aria-label={bookmarkMode ? t('search_bookmark_placeholder') : t('search_engine_placeholder', engineConfig.name)}
          className="flex-1 bg-transparent text-white placeholder-white/50 outline-none text-base"
        />
        
        {/* 书签搜索模式切换按钮 */}
        <button
          onClick={() => setBookmarkMode(!bookmarkMode)}
          className={`p-2 rounded-full transition-all active:scale-90 ${
            bookmarkMode
              ? 'bg-blue-500/30 text-blue-400'
              : 'text-white/40 hover:text-white/70 hover:bg-white/10'
          }`}
          title={bookmarkMode ? t('switch_to_search_engine') : t('switch_to_bookmark_search')}
          aria-label={bookmarkMode ? t('switch_to_search_engine') : t('switch_to_bookmark_search')}
        >
          <BookMarked className="w-4 h-4" />
        </button>
      </div>

      {/* 搜索建议 */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-xl glass-dark overflow-hidden animate-scaleIn z-[100]">
          {suggestions.map((result, index) => (
            <div
              key={result.id}
              className={`
                w-full flex items-start gap-3 px-4 py-3
                transition-colors
                ${index === selectedIndex ? 'bg-white/20' : 'hover:bg-white/10'}
              `}
            >
              <button
                onClick={() => handleSelect(result)}
                className="flex items-start gap-3 flex-1 min-w-0 text-left"
              >
                <img 
                  src={getFaviconUrl(result.favicon, result.url)} 
                  alt="" 
                  className="w-5 h-5 rounded flex-shrink-0 mt-0.5"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{result.title}</div>
                  <div className="text-xs text-white/50 truncate">{result.url}</div>
                  
                  {/* 标签 */}
                  {result.tags && result.tags.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {result.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag.id}
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{ 
                            backgroundColor: `${tag.color}20`,
                            color: tag.color 
                          }}
                        >
                          #{tag.name}
                        </span>
                      ))}
                      {result.tags.length > 3 && (
                        <span className="text-xs text-white/40">
                          +{result.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* 描述 */}
                  {result.description && (
                    <div className="text-xs text-white/40 mt-1 line-clamp-1">
                      {result.description}
                    </div>
                  )}
                </div>
              </button>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* 点击次数 */}
                {result.click_count !== undefined && result.click_count > 0 && (
                  <span className="text-xs text-white/30">
                    👆 {result.click_count}
                  </span>
                )}
                
                {/* 来源标识 */}
                <span className="text-xs text-white/30">
                  {result.source === 'shortcut' ? t('source_shortcut') : t('source_bookmark')}
                </span>
                
                {/* 固定按钮 */}
                {result.source === 'bookmark' && !result.is_pinned && (
                  <button
                    onClick={(e) => handlePinToNewTab(e, result)}
                    className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-blue-400 transition-colors"
                    title={t('pin_to_newtab')}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
