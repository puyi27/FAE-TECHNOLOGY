import { type Presence } from '../types';
import { useTranslation } from 'react-i18next';

// --- ICONOS DE ESTADO ---
import BusinessIcon from '@mui/icons-material/Business';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import SickIcon from '@mui/icons-material/Sick';
import LuggageIcon from '@mui/icons-material/Luggage';
import AddIcon from '@mui/icons-material/Add';

interface DayCellProps {
  presence?: Presence;
  onAdd: () => void;
  isEditable: boolean;
}

/**
 * Traduce el emoji guardado en la base de datos a un componente de Material UI.
 */
export const getCategoryIcon = (iconStr?: string | null) => {
  switch (iconStr) {
    case '🏢': return <BusinessIcon fontSize="inherit" />;
    case '🏠': return <HomeWorkIcon fontSize="inherit" />;
    case '🏖️': return <BeachAccessIcon fontSize="inherit" />;
    case '🤒': return <SickIcon fontSize="inherit" />;
    case '💼': return <LuggageIcon fontSize="inherit" />;
    default: return iconStr || '📍';
  }
};

export const DayCell = ({ presence, onAdd, isEditable }: DayCellProps) => {
  const { t } = useTranslation();

  return (
    <div
      onClick={isEditable ? onAdd : undefined}
      className={`w-full h-full flex items-center justify-center transition-colors p-2 group/cell
        ${isEditable ? 'cursor-pointer hover:bg-base-200' : 'cursor-default'}`}
      title={presence ? `${t('daycell.status')}: ${presence.categories?.name}` : undefined}
    >
      {presence ? (
        // Estado: Día con presencia asignada
        <div className="flex flex-col items-center">
          <span className="text-3xl flex items-center justify-center text-base-content/80 drop-shadow-sm">
            {getCategoryIcon(presence.categories?.icon)}
          </span>
          <span className="text-[10px] text-base-content/60 font-black mt-1 text-center uppercase tracking-widest leading-tight">
            {t(`categories_list.${presence.categories?.name}`, { defaultValue: presence.categories?.name })}
          </span>
        </div>
      ) : (
        // Estado: Día vacío (Muestra botón "+" fantasma solo si es editable)
        isEditable && (
          <div className="opacity-0 group-hover/cell:opacity-100 transition-opacity duration-300">
            <div className="w-10 h-10 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center text-primary/50 group-hover/cell:border-primary group-hover/cell:text-primary transition-all bg-base-100/50 shadow-inner scale-90 group-hover/cell:scale-100">
              <AddIcon fontSize="small" />
            </div>
          </div>
        )
      )}
    </div>
  );
};