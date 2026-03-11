import BusinessIcon from '@mui/icons-material/Business';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import SickIcon from '@mui/icons-material/Sick';
import LuggageIcon from '@mui/icons-material/Luggage';

export const getDynamicCategoryName = (cat: any, currentLang: string, t: any) => {
  if (!cat) return '';
  if (currentLang === 'es' && cat.name_es) return cat.name_es;
  if (currentLang === 'en' && cat.name_en) return cat.name_en;
  // Fallback a i18n o al nombre base (que suele estar en italiano si se crea desde ahí)
  return t(`categories_list.${cat.name}`, { defaultValue: cat.name });
};

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