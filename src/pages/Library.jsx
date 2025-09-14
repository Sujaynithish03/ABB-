import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { LibraryService } from '@/lib/libraryService';
import { 
  MagnifyingGlassIcon, 
  BookOpenIcon, 
  CalendarIcon,
  TagIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export function Library() {
  const { user, getIdToken } = useAuth();
  const navigate = useNavigate();
  
  const [libraryService, setLibraryService] = useState(null);
  const [entries, setEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [stats, setStats] = useState(null);

  // Initialize library service
  useEffect(() => {
    if (user && getIdToken) {
      const service = new LibraryService(user, getIdToken);
      setLibraryService(service);
    }
  }, [user, getIdToken]);

  // Load initial data
  useEffect(() => {
    if (libraryService) {
      loadLibraryData();
    }
  }, [libraryService]);

  const loadLibraryData = async () => {
    try {
      setIsLoading(true);
      const entriesData = await libraryService.getLibraryEntries();
      setEntries(entriesData);
      
      // Calculate stats in frontend
      const total = entriesData.length;
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const recentCount = entriesData.filter(entry => {
        const entryDate = new Date(entry.created_at);
        return entryDate >= sevenDaysAgo;
      }).length;
      
      const categoryMap = {};
      entriesData.forEach(entry => {
        const category = entry.category || 'General';
        categoryMap[category] = (categoryMap[category] || 0) + 1;
      });
      
      const categories = Object.entries(categoryMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
      
      setStats({
        total_entries: total,
        recent_entries_count: recentCount,
        categories
      });
    } catch (error) {
      console.error('Error loading library data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      setIsSearching(true);
      
      // Filter entries on frontend
      const query = searchQuery.trim().toLowerCase();
      const filtered = entries.filter(entry => {
        const questionMatch = entry.user_question.toLowerCase().includes(query);
        const responseMatch = entry.assistant_response.toLowerCase().includes(query);
        const tagsMatch = entry.tags.some(tag => tag.toLowerCase().includes(query));
        return questionMatch || responseMatch || tagsMatch;
      });
      
      setSearchResults({
        entries: filtered,
        total: filtered.length,
        query: searchQuery.trim()
      });
    } catch (error) {
      console.error('Error searching library:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const displayEntries = searchResults ? searchResults.entries : entries;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading your library...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Chat
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <BookOpenIcon className="w-6 h-6 text-blue-600" />
              <h1 className="text-lg font-semibold text-gray-900">Global Knowledge Library</h1>
            </div>
            <div className="flex items-center gap-3">
              {user?.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="h-8 w-8 rounded-full"
                />
              )}
              <span className="text-sm text-gray-700">
                {user?.displayName || user?.email}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <BookOpenIcon className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Entries</p>
                  <p className="text-2xl font-semibold">{stats.total_entries}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Recent (7 days)</p>
                  <p className="text-2xl font-semibold">{stats.recent_entries_count}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <TagIcon className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Categories</p>
                  <p className="text-2xl font-semibold">{stats.categories.length}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Search */}
        <Card className="p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your saved questions and answers..."
                className="w-full"
              />
            </div>
            <Button type="submit" disabled={isSearching}>
              <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
            {searchResults && (
              <Button variant="outline" onClick={clearSearch}>
                Clear
              </Button>
            )}
          </form>
          
          {searchResults && (
            <div className="mt-4 text-sm text-gray-600">
              Found {searchResults.total} result(s) for "{searchResults.query}"
            </div>
          )}
        </Card>

        {/* Entries */}
        {displayEntries.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpenIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchResults ? 'No search results' : 'No saved entries yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchResults 
                ? 'Try adjusting your search terms'
                : 'Start saving accurate AI responses to build your knowledge library'
              }
            </p>
            {!searchResults && (
              <Button onClick={() => navigate('/')}>
                Go to Chat
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-6">
            {displayEntries.map((entry) => (
              <Card key={entry.entry_id} className="p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      {formatDate(entry.created_at)}
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      Added by {entry.user_name || 'Anonymous User'}
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    {entry.user_question}
                  </h3>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">AI Response:</h4>
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {entry.assistant_response}
                  </p>
                </div>
                
                {entry.tags && entry.tags.length > 0 && (
                  <div className="mt-4 flex gap-2">
                    {entry.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
