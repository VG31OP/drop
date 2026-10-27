import React, {
  Suspense,
  TouchEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useParams } from 'wouter';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18not';
import clsx from 'clsx';
import {
  IoChatbubbles,
  IoCloudUpload,
  IoPencil,
  IoPhonePortrait,
  IoSettings,
} from 'react-icons/io5';

import styles from './Home.module.scss';
import { applicationStore, chatStore, connection, networkStore } from '../stores/index.js';
import { Footer } from '../components/Footer.js';
import { Modal } from '../components/Modal.js';
import { NotificationCount } from '../components/NotificationCount.js';
import { ClipboardModal } from '../modals/ClipboardModal.js';
import { IncompatibleBrowserSection } from '../sections/IncompatibleBrowser/index.js';
import { YourTileSection } from '../sections/YourTile/index.js';
import { NoticeSection } from '../sections/Notice/index.js';
import { NetworkSection } from '../sections/Network/index.js';
import { TransfersSection } from '../sections/Transfers/index.js';
import { PublicRoomsSection } from '../sections/PublicRooms/index.js';
import { ChatSection } from '../sections/Chat/index.js';
import { MobileTabs } from '../sections/MobileTabs/index.js';
import { SettingsSection } from '../sections/Settings/index.js';

const ConnectSection = React.lazy(() => import('../sections/Connect/index.js'));

function itemToString(item: DataTransferItem): Promise<string> {
  return new Promise(resolve => {
    item.getAsString(resolve);
  });
}

export const Home: React.FC = observer(() => {
  const { t } = useTranslation();
  const [clipboardFiles, setClipboardFiles] = useState<File[]>([]);
  const { networkName } = useParams<{ networkName: string }>();
  const tab = applicationStore.tab;
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const tabs = useMemo(() => ['files', 'devices', 'chat', 'settings'], []);

  useEffect(() => {
    if (networkName) {
      networkStore.updateNetworkName(networkName);
    }
  }, [networkName]);

  useEffect(() => {
    const onPaste = async (e: ClipboardEvent) => {
      if (!networkStore.clients.length) return;

      const element = e.target as HTMLElement;
      if (
        document.body.contains(element) &&
        (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT')
      ) {
        return;
      }

      const files = [];
      for (let item of e.clipboardData!.items) {
        const file = item.getAsFile();

        if (file) {
          files.push(file);
        } else if (item.type === 'text/plain') {
          const str = await itemToString(item);
          files.push(new File([str], 'clipboard.txt', { type: 'text/plain' }));
        }
      }

      if (networkStore.clients.length === 1) {
        const clientId = networkStore.clients[0].clientId;
        for (const file of files) {
          networkStore.createTransfer(file, clientId);
        }
      } else {
        setClipboardFiles(files);
      }
    };

    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [setClipboardFiles]);

  if (connection.disconnectReason) {
    return (
      <div className={styles.disconnected}>
        <div className="subsection">
          <h2>{t('disconnected.title')}</h2>
          <div>
            <span>{t('disconnected.reason')}</span>{' '}
            {t(`disconnected.reasons.${connection.disconnectReason}`)}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const dismissClipboard = () => setClipboardFiles([]);
  const modal = applicationStore.modal;

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (!e.changedTouches || !e.changedTouches[0]) return;
    touchStartX.current = e.changedTouches[0].clientX;
    touchStartY.current = e.changedTouches[0].clientY;
  };

  const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (!e.changedTouches || !e.changedTouches[0]) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy)) return;

    const index = tabs.indexOf(tab);
    if (index < 0) return;

    if (dx < 0 && index < tabs.length - 1) applicationStore.setTab(tabs[index + 1]);
    if (dx > 0 && index > 0) applicationStore.setTab(tabs[index - 1]);
  };

  const currentDeviceName = networkStore.currentClient?.clientName || 'Your Device';

  return (
    <>
      <ClipboardModal
        files={clipboardFiles}
        dismissClipboard={dismissClipboard}
      />
      <Modal
        onClose={() => applicationStore.closeModal()}
        title={t('tabs.connect')}
        isOpen={modal === 'connect'}
      >
        <ConnectSection />
      </Modal>
      <div
        className={styles.home}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <aside className={styles.sidebar}>
          <div className={styles.sidebarNav}>
            <button
              className={clsx(styles.navItem, { [styles.active]: tab === 'files' })}
              onClick={() => applicationStore.setTab('files')}
              aria-label={t('tabs.files')}
            >
              <div className={styles.navIcon}>
                <NotificationCount count={networkStore.incomingTransfers.length} />
                <IoCloudUpload />
              </div>
              <span>{t('tabs.files')}</span>
            </button>
            <button
              className={clsx(styles.navItem, { [styles.active]: tab === 'devices' })}
              onClick={() => applicationStore.setTab('devices')}
              aria-label={t('tabs.devices')}
              title={t('tabs.devices')}
            >
              <div className={styles.navIcon}>
                <IoPhonePortrait />
              </div>
              <span>{t('tabs.devices')}</span>
            </button>
            <button
              className={clsx(styles.navItem, { [styles.active]: tab === 'chat' })}
              onClick={() => applicationStore.setTab('chat')}
              aria-label={t('tabs.chat')}
            >
              <div className={styles.navIcon}>
                <NotificationCount count={chatStore.unread} />
                <IoChatbubbles />
              </div>
              <span>{t('tabs.chat')}</span>
            </button>
            <button
              className={clsx(styles.navItem, { [styles.active]: tab === 'settings' })}
              onClick={() => applicationStore.setTab('settings')}
              aria-label={t('tabs.settings')}
            >
              <div className={styles.navIcon}>
                <IoSettings />
              </div>
              <span>{t('tabs.settings')}</span>
            </button>
          </div>

          <div
            className={styles.sidebarRenameCallout}
            onClick={() => applicationStore.setTab('devices')}
            role="button"
            tabIndex={0}
            title="Click to change your username"
          >
            <div className={styles.calloutTag}>
              <div className={styles.calloutHeader}>
                <IoPencil className={styles.calloutPencil} />
                <span>TIP</span>
              </div>
              <div className={styles.calloutMessage}>
                You can change username from here!
              </div>
            </div>

            <svg
              className={styles.squiggleArrow}
              viewBox="0 0 90 130"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Hand-drawn curly loop-de-loop arrow matching reference image 3 */}
              <path
                d="M 56 6 C 58 20, 54 36, 46 50 C 36 62, 10 54, 10 74 C 10 94, 34 94, 46 78 C 54 66, 68 84, 58 116"
                stroke="#000000"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Hand-drawn open chevron arrowhead */}
              <path
                d="M 42 100 L 58 116 L 72 100"
                stroke="#000000"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div
            className={styles.sidebarFooter}
            onClick={() => applicationStore.setTab('devices')}
            title="Click to edit your username"
          >
            <span className={styles.sidebarOnlineDot} />
            <span className={styles.sidebarDeviceName}>{currentDeviceName}</span>
            <span className={styles.sidebarEditIcon} aria-label="Edit name">
              <IoPencil />
            </span>
          </div>
        </aside>

        <div className={styles.body}>
          <div className={clsx(styles.panel, { [styles.hidden]: tab !== 'files' })}>
            <IncompatibleBrowserSection />
            <NoticeSection />
            <NetworkSection />
            <TransfersSection />
            <PublicRoomsSection />
          </div>
          <div className={clsx(styles.panel, { [styles.hidden]: tab !== 'devices' })}>
            <div className={styles.sectionHeader}>{t('tabs.devices')}</div>
            <YourTileSection />
            <Suspense>
              <ConnectSection />
            </Suspense>
          </div>
          <div className={clsx(styles.panel, { [styles.hidden]: tab !== 'chat' })}>
            <ChatSection />
          </div>
          <div className={clsx(styles.panel, { [styles.hidden]: tab !== 'settings' })}>
            <SettingsSection />
            <Footer />
          </div>
        </div>
      </div>
      <MobileTabs />
    </>
  );
});
