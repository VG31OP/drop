import React from 'react';
import { IoQrCode } from 'react-icons/io5';
import { observer } from 'mobx-react-lite';

import styles from './Header.module.scss';
import { Link } from './Link.js';
import { DropIcon } from './DropIcon.js';
import { applicationStore, networkStore } from '../stores/index.js';
import { IconButton } from './IconButton.js';

export const Header: React.FC = observer(() => {
  return (
    <header className={styles.header}>
      <div className={styles.menu}>
        <Link to="/" className={styles.logo}>
          <DropIcon />
          <span>{applicationStore.appName}</span>
        </Link>
        <div className={styles.roomCode}>
          {networkStore.networkName ? networkStore.networkName.toUpperCase() : '----'}
        </div>
        <IconButton
          onClick={() => applicationStore.openModal('connect')}
          title="Open QR"
          className={styles.qr}
        >
          <IoQrCode />
        </IconButton>
      </div>
    </header>
  );
});
