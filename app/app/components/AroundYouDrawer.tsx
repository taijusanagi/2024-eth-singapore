import React, { useState, useRef, useEffect } from 'react';

interface Item {
  id: number;
  type: string;
  count: number;
  distance: number;
  action: string;
}

interface AroundYouDrawerProps {
  onClose: () => void;
}

const AroundYouDrawer: React.FC<AroundYouDrawerProps> = ({ onClose }) => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const items: Item[] = [
    { id: 1, type: '👾', count: 10, distance: 10, action: 'Attack' },
    { id: 2, type: '🪙', count: 8, distance: 10, action: 'Collect' },
    { id: 3, type: '👻', count: 9, distance: 13, action: 'Go' },
    // 添加更多项目...
  ];

  const filteredItems = selectedFilter === 'All'
    ? items
    : items.filter(item => item.type === selectedFilter);

  const handleItemClick = (itemId: number) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div ref={drawerRef} className="bg-white p-6 rounded-t-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-black">Around you</h2>
        <div className="flex space-x-2 mb-4">
          {['All', '👾', '🪙', '👻'].map(filter => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1 rounded-full ${selectedFilter === filter ? 'bg-black text-white' : 'bg-white text-black border border-gray-300'
                }`}
            >
              {filter === 'All' ? filter : `${filter} ${items.filter(item => item.type === filter).length}`}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {filteredItems.map(item => (
            <div key={item.id} className="cursor-pointer">
              <div
                onClick={() => handleItemClick(item.id)}
                className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{item.type}</span>
                  <span className="text-xl text-black">{item.count}</span>
                </div>
                <div className="text-black">{item.distance} blocks away</div>
              </div>
              {expandedItem === item.id && (
                <div className="mt-2 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <img src="/path/to/player-icon.png" alt="Player" className="w-8 h-8" />
                      <div>
                        <div className="text-sm text-black">Player</div>
                        <div className="font-bold text-black">alice.eth</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-black">Faction</div>
                      <div className="font-bold text-black">Moloch</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-black">Estimates on Winning</div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="text-black">-1 🔋 Energy</div>
                      <div className="text-black">+? {item.type} Resources</div>
                    </div>
                  </div>
                  <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg">
                    Confirm {item.action}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 bg-gray-200 text-black px-4 py-2 rounded-full w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AroundYouDrawer;