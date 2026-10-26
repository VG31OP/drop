import React from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';

import styles from './index.module.scss';
import { applicationStore } from '../../stores/index.js';

export const NoticeSection: React.FC = observer(() => {
  const { noticeText, noticeUrl } = applicationStore;

  if (!noticeText) {
    return null;
  }

  const isSafeUrl = noticeUrl && /^https?:\/\//i.test(noticeUrl);

  return (
    <div className={clsx('subsection', styles.notice)}>
      {isSafeUrl ? (
        <a href={noticeUrl} target="_blank" rel="noopener noreferrer">
          {noticeText}
        </a>
      ) : (
        noticeText
      )}
    </div>
  );
});
