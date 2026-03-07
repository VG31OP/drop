import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18not';

import { Loading } from '../components/Loading.js';
import { nameCharacterSet, nameLength } from '../config.js';
import { randomString } from '../utils/string.js';

export const Redirect: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useLocation()[1];

  useEffect(() => {
    const currentNetworkName = randomString(nameLength, nameCharacterSet);
    navigate('/' + currentNetworkName + window.location.hash, {
      replace: true,
    });
  }, [navigate]);

  return <Loading>{t('state.loading')}</Loading>;
};
