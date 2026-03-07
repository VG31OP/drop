import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';

import styles from './Footer.module.scss';

export const Footer: React.FC = observer(() => {
  return (
    <footer className={clsx(styles.footer)}>
      <ul>
        <li>
          <a href="https://drop.shiroya.in/privacy" target="_blank" rel="noreferrer">
            Privacy policy
          </a>
        </li>
        <li>
          <a href="https://drop.shiroya.in/terms" target="_blank" rel="noreferrer">
            Terms of service
          </a>
        </li>
        <li>
          <a href="mailto:vraj@shiroya.in">Abuse: vraj@shiroya.in</a>
        </li>
        <li>
          <a
            href="https://github.com/VG31OP/drop"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/VG31OP/drop
          </a>
        </li>
      </ul>
    </footer>
  );
});
