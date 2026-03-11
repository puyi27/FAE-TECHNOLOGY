import { type Presence } from '../types';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add'; 
import { getDynamicCategoryName, getCategoryIcon } from '../utils/categoryUtils'; // Importación correcta

interface DayCellProps {
  presence?: Presence;
  onAdd: () => void;
  isEditable: boolean;
}

export const DayCell = ({ presence, onAdd, isEditable }: DayCellProps) => {
  const { t, i18n } = useTranslation();
  
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