import React from 'react';
import { IoCheckmark, IoCopyOutline, IoQrCode, IoShareSocialOutline } from 'react-icons/io5';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18not';

import styles from './Header.module.scss';
import { Link } from './Link.js';
import { DropIcon } from './DropIcon.js';
import { applicationStore, connection, networkStore } from '../stores/index.js';
import { copy } from '../utils/copy.js';
import { useTimedState } from '../utils/hooks.js';
import { isShareSupported } from '../utils/browser.js';

export const Header: React.FC = observer(() => {
  const { t } = useTranslation();
  const [copied, setCopied] = useTimedState(false);
  const roomName = networkStore.networkName ? networkStore.networkName.toUpperCase() : '----';
  const isConnected = connection.connected;

  const handleCopyRoom = () => {
    copy(window.location.href);
    setCopied(true);
  };

  return (
    <header className={styles.header}>
      <div className={styles.menu}>
        <div className={styles.left}>
          <Link to="/" className={styles.logo}>
            <div className={styles.iconWrap}>
              <DropIcon />
              <span
                className={styles.statusDot}
                title={isConnected ? 'Connected' : 'Connecting...'}
                data-connected={isConnected}
              />
            </div>
            <span className={styles.brandTitle}>{applicationStore.appName}</span>
          </Link>
        </div>

        <div className={styles.center}>
          <button
            type="button"
            className={styles.roomBadge}
            onClick={handleCopyRoom}
            title={copied ? t('copied') : 'Click to copy room link'}
            aria-label="Copy room link"
          >
            <span className={styles.roomPrefix}>ROOM</span>
            <span className={styles.roomCode}>{roomName}</span>
            <span className={styles.roomAction}>
              {copied ? (
                <span className={styles.copiedText}>
                  <IoCheckmark /> {t('copied')}
                </span>
              ) : (
                <IoCopyOutline className={styles.copyIcon} />
              )}
            </span>
          </button>
        </div>

        <div className={styles.right}>
          <button
            type="button"
            onClick={() => applicationStore.openModal('connect')}
            title={t('tabs.connect')}
            aria-label={t('tabs.connect')}
            className={styles.connectButton}
          >
            <IoQrCode className={styles.qrIcon} />
            <span className={styles.connectLabel}>{t('tabs.connect')}</span>
          </button>
          {isShareSupported && (
            <button
              type="button"
              onClick={() => applicationStore.share(window.location.href)}
              title={t('share')}
              aria-label={t('share')}
              className={styles.shareIconButton}
            >
              <IoShareSocialOutline />
            </button>
          )}
        </div>
      </div>
    </header>
  );
});
