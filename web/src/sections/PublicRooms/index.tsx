import React from 'react';
import { useTranslation } from 'react-i18not';
import { observer } from 'mobx-react-lite';

import styles from './index.module.scss';
import { LocalNetworks } from '../LocalNetworks/index.js';

export const PublicRoomsSection: React.FC = observer(() => {
  const { t } = useTranslation();

  return (
    <div className="subsection">
      <div className={styles.publicRoomsTitle}>
        <span>{t('publicRooms.title')}</span>
      </div>
      <LocalNetworks />
    </div>
  );
});

export default PublicRoomsSection;
