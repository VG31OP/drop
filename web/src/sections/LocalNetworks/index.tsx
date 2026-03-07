import React from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18not';

import styles from './index.module.scss';
import { Link } from '../../components/Link.js';
import { applicationStore, networkStore } from '../../stores/index.js';

export const LocalNetworks: React.FC = observer(() => {
  const { t } = useTranslation();
  const rooms = networkStore.otherPublicRooms;

  return (
    <div className={clsx(styles.list)}>
      {rooms.length === 0 && (
        <div className={styles.empty}>{t('publicRooms.empty')}</div>
      )}
      {rooms.map(room => (
        <Link
          to={`/${room.name}`}
          key={room.name}
          className={styles.room}
          onClick={() => {
            applicationStore.closeModal();
            applicationStore.setTab('files');
          }}
        >
          <div className={styles.meta}>
            <span className={styles.code}>{room.name}</span>
            <span className={styles.count}>
              {t('publicRooms.people', { count: room.clients })}
            </span>
          </div>
          <span className={styles.joinButton}>{t('publicRooms.join')}</span>
        </Link>
      ))}
    </div>
  );
});
