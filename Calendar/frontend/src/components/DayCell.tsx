import { type Presence } from '../types';
import { useTranslation } from 'react-i18next'; // 👈 Añadido

interface DayCellProps {
  presence?: Presence;
  onAdd: () => void;
}

export const DayCell = ({ presence, onAdd }: DayCellProps) => {
  const { t } = useTranslation(); // 👈 Añadido
  return (
    <div 
      onClick={onAdd} 
      className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-base-200 transition-colors p-2"
      title={presence ? `${t('daycell.status')}: ${presence.categories?.name}` : t('daycell.click_add')}
    >
      {presence ? (
        <div className="flex flex-col items-center">
          <span className="text-2xl">{presence.categories?.icon || '📍'}</span>
          <span className="text-[10px] text-base-content/60 font-medium mt-1 text-center leading-tight">
            {presence.categories?.name}
          </span>
        </div>
      ) : (
        <span className="text-base-content/20 text-3xl hover:text-base-content/50 transition-colors"></span>
      )}
    </div>
  );
};