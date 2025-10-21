import React from 'react';
import { Select } from 'antd';
import { useTranslation } from '../hooks/useTranslation';

const { Option } = Select;

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useTranslation();

  const handleLanguageChange = (value) => {
    changeLanguage(value);
  };

  return (
    <Select value={language} onChange={handleLanguageChange} style={{ width: 120 }} size='small'>
      <Option value='vi'>🇻🇳 Tiếng Việt</Option>
      <Option value='en'>🇺🇸 English</Option>
    </Select>
  );
};

export default LanguageSwitcher;
