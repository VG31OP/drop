import React, { useState } from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18not';
import {
  IoCheckmark,
  IoClipboard,
  IoCloseCircle,
  IoCopyOutline,
  IoQrCode,
  IoShareSocialOutline,
  IoWifiOutline,
} from 'react-icons/io5';

import styles from './index.module.scss';
import { Network } from '../../components/Network.js';
import { applicationStore, networkStore } from '../../stores/index.js';
import { Button } from '../../components/Button.js';
import { Toggle } from '../../components/Toggle.js';
import { mimeToExtension } from '../../utils/file.js';
import { copy } from '../../utils/copy.js';
import { useTimedState } from '../../utils/hooks.js';

export const NetworkSection: React.FC = observer(() => {
  const clients = networkStore.clients;
  const transfers = networkStore.transfers;
  const { t } = useTranslation();
  const [isPaste, setPaste] = useState(window.location.hash === '#paste');
  const [copiedLink, setCopiedLink] = useTimedState(false);
  const showPaste = applicationStore.showPaste;
  const sendFromClipboard = isPaste && showPaste;

  const handleShareOrCopy = () => {
    const url = window.location.href;
    if (navigator.share) {
      applicationStore.share(url);
    } else {
      copy(url);
      setCopiedLink(true);
    }
  };

  const handleCopy = () => {
    copy(window.location.href);
    setCopiedLink(true);
  };

  return (
    <>
      {!!networkStore.networkError && (
        <div className={clsx('subsection', styles.errorBanner)}>
          <IoCloseCircle className={styles.errorIcon} />
          <span>{t(`error.network.${networkStore.networkError}`)}</span>
        </div>
      )}

      <div className={clsx('subsection', styles.peersSection)}>
        {clients.length > 0 ? (
          <>
            <div className={styles.peersHeader}>
              <div className={styles.peersTitle}>
                <span className={styles.activeDot} />
                <span>Connected Devices</span>
                <span className={styles.peerCount}>{clients.length}</span>
              </div>
              {showPaste && (
                <div className={styles.clipboardToggle}>
                  <Toggle
                    label={t('sendFromClipboard')}
                    value={isPaste}
                    onChange={setPaste}
                  />
                </div>
              )}
            </div>

            <div className={styles.networkGrid}>
              <Network
                icon={sendFromClipboard ? <IoClipboard /> : undefined}
                onSelect={
                  sendFromClipboard
                    ? async clientId => {
                        try {
                          const items = await navigator.clipboard.read();
                          if (items?.length) {
                            for (const item of items) {
                              const blob = await item.getType(item.types[0]);
                              const file = new File(
                                [blob],
                                `clipboard${mimeToExtension(blob.type)}`,
                                { type: blob.type }
                              );

                              networkStore.createTransfer(file, clientId);
                            }
                          }
                        } catch {}
                      }
                    : undefined
                }
              />
            </div>

            <div className={styles.transferHint}>
              <span>{t('tile')}</span>
              {transfers.size === 0 && !showPaste && (
                <span className="mobileHidden"> • {t('desktopHint')}</span>
              )}
            </div>
          </>
        ) : (
          <div className={styles.emptyRadar}>
            <div className={styles.radarContainer}>
              <div className={styles.radarRing} />
              <div className={styles.radarRingDelay} />
              <div className={styles.radarCenter}>
                <IoWifiOutline />
              </div>
            </div>

            <div className={styles.emptyContent}>
              <h3 className={styles.emptyTitle}>
                {t('emptyNetwork.title')}
              </h3>
              <p className={styles.emptySubtitle}>
                {t('emptyNetwork.body')} Scan the QR code or share your room link to send files instantly with zero size limits.
              </p>

              <div className={styles.emptyActions}>
                <Button
                  onClick={handleShareOrCopy}
                  className={styles.shareBtn}
                  type="button"
                >
                  {copiedLink ? (
                    <>
                      <IoCheckmark /> {t('copied')}
                    </>
                  ) : navigator.share ? (
                    <>
                      <IoShareSocialOutline /> {t('share')} Link
                    </>
                  ) : (
                    <>
                      <IoCopyOutline /> Copy Room Link
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => applicationStore.openModal('connect')}
                  className={styles.qrBtn}
                >
                  <IoQrCode />
                  <span>{t('emptyNetwork.qr')}</span>
                </button>
              </div>

              <div className={styles.roomPill} onClick={handleCopy} title="Copy link">
                <span className={styles.roomLabel}>Your Room:</span>
                <span className={styles.roomValue}>
                  {networkStore.networkName ? networkStore.networkName.toUpperCase() : '----'}
                </span>
                <IoCopyOutline className={styles.roomCopyIcon} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
});
