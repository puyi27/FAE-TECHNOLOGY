import { type Presence } from '../types';
import { useTranslation } from 'react-i18next';
import BusinessIcon from '@mui/icons-material/Business';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import SickIcon from '@mui/icons-material/Sick';
import LuggageIcon from '@mui/icons-material/Luggage';
import AddIcon from '@mui/icons-material/Add'; 


export const getDynamicCategoryName = (cat: any, currentLang: string, t: any) => {
  if (!cat) return '';
  
  // 1. Prioridad: Lo que esté guardado en la Base de Datos
  if (currentLang === 'es' && cat.name_es) return cat.name_es;
  if (currentLang === 'en' && cat.name_en) return cat.name_en;
  
  // 2. Si la Base de Datos está vacía, lee tu archivo .json
  return t(`categories_list.${cat.name}`, { defaultValue: cat.name });
};

interface DayCellProps {
  presence?: Presence;
  onAdd: () => void;
  isEditable: boolean;
}

export const DayCell = ({ presence, onAdd, isEditable }: DayCellProps) => {
  const { t, i18n } = useTranslation();
  
  const getCategoryIcon = (iconStr?: string | null) => {
    switch (iconStr) {
      case '🏢': return <BusinessIcon fontSize="inherit" />;
      case '🏠': return <HomeWorkIcon fontSize="inherit" />;
      case '🏖️': return <BeachAccessIcon fontSize="inherit" />;
      case '🤒': return <SickIcon fontSize="inherit" />;
      case '💼': return <LuggageIcon fontSize="inherit" />;
      default: return iconStr || '📍';
    }
  };

  return (
    <div
      onClick={isEditable ? onAdd : undefined}
      className={`w-full h-full flex items-center justify-center transition-colors p-2 group/cell
        ${isEditable ? 'cursor-pointer hover:bg-base-200' : 'cursor-default'}`}
      title={
        presence 
          ? `${t('daycell.status')}: ${getDynamicCategoryName(presence.categories, i18n.language, t)}` 
          : undefined
      }
    >
      {presence ? (
        <div className="flex flex-col items-center">
          <span className="text-3xl flex items-center justify-center text-base-content/80 drop-shadow-sm">
            {getCategoryIcon(presence.categories?.icon)}
          </span>
          <span className="text-[10px] text-base-content/60 font-black mt-1 text-center uppercase tracking-widest leading-tight">

            {getDynamicCategoryName(presence.categories, i18n.language, t)}
          </span>
        </div>
      ) : (
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