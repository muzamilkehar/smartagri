import { useTranslation } from 'react-i18next';
import { MdLanguage } from 'react-icons/md';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (e) => {
        i18n.changeLanguage(e.target.value);
    };

    return (
        <div className="relative flex items-center gap-2">
            <MdLanguage className="text-gray-500 text-lg" />
            <select
                onChange={changeLanguage}
                value={i18n.language}
                className="bg-transparent border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-1.5 outline-none cursor-pointer hover:bg-gray-50 transition-colors"
            >
                <option value="en">English</option>
                <option value="ur">اردو (Urdu)</option>
            </select>
        </div>
    );
};

export default LanguageSwitcher;