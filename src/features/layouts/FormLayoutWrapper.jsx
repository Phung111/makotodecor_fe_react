import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import FormLayout from './FormLayout';

const FormLayoutWrapper = ({ mode, children }) => {
  const { t } = useTranslation();

  const getTitle = () => {
    switch (mode) {
      case 'create':
        return t('product.form.createTitle');
      case 'edit':
        return t('product.form.editTitle');
      case 'view':
        return t('product.form.viewTitle');
      default:
        return t('product.form.createTitle');
    }
  };

  return <FormLayout title={getTitle()}>{children}</FormLayout>;
};

export default FormLayoutWrapper;
