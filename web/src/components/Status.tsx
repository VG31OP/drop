import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';

import styles from './Status.module.scss';
import { connection } from '../stores/index.js';
import { DropIcon } from './DropIcon.js';

export const Status: React.FC = observer(() => {
  return !connection.connected && !connection.disconnectReason ? (
    <div className={clsx(styles.status)}>
      <div className={styles.center}>
        <DropIcon />
        <div className={styles.spinner} />
        <h3>Establishing secure connection...</h3>
      </div>
    </div>
  ) : null;
});
