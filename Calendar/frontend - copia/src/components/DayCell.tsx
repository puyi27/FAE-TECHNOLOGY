import { type Presence } from '../types';

interface DayCellProps {
  presence?: Presence;
  onAdd: () => void;
}

export const DayCell = ({ presence, onAdd }: DayCellProps) => {
  return (
    <div 
      onClick={onAdd} 
      className="w-full h-full min-h-[80px] flex items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors group"
      title={presence ? `Categoría: ${presence.category.name}` : "Haga clic para marcar presencia"}
    >
      {presence ? (
        <div className="flex flex-col items-center">
          <span className="text-2xl animate-bounce-short">
            {presence.category.icon}
          </span>
          <span className="text-[10px] text-gray-400 font-medium uppercase mt-1">
            {presence.category.name}
          </span>
        </div>
      ) : (
        <span className="text-gray-200 group-hover:text-blue-400 text-2xl font-light transition-all">
          +
        </span>
      )}
    </div>
  );
};