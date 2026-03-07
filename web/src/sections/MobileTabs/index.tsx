import React from 'react';
import {
  IoChatbubbles,
  IoCloudUpload,
  IoPhonePortrait,
  IoSettings,
} from 'react-icons/io5';
import { observer } from 'mobx-react-lite';

import styles from './index.module.scss';
import { Tab } from './Tab.js';
import { chatStore, networkStore } from '../../stores/index.js';
import { NotificationCount } from '../../components/NotificationCount.js';

export const MobileTabs: React.FC = observer(() => {
  return (
    <div className={styles.tabs} role="tablist">
      <Tab id="files" label="Files">
        <NotificationCount count={networkStore.incomingTransfers.length} />
        <IoCloudUpload />
      </Tab>
      <Tab id="devices" label="Add Devices">
        <IoPhonePortrait />
      </Tab>
      <Tab id="chat" label="Chat">
        <NotificationCount count={chatStore.unread} />
        <IoChatbubbles />
      </Tab>
      <Tab id="settings" label="Settings">
        <IoSettings />
      </Tab>
    </div>
  );
});
