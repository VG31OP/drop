import React from 'react';
import clsx from 'clsx';
import {
  IoLockClosed,
  IoPhonePortraitOutline,
  IoDesktopOutline,
  IoTabletPortraitOutline,
  IoWifiOutline,
} from 'react-icons/io5';
import { ClientModel, DeviceType } from '@filedrop/types';
import { observer } from 'mobx-react-lite';

import styles from './TargetTile.module.scss';
import { uuidToColor } from '../utils/color.js';
import { connection, settingsStore } from '../stores/index.js';

interface TargetTileProps extends React.HTMLProps<HTMLDivElement> {
  client: ClientModel;
  variant?: 'small' | 'medium' | 'big';
}

export const TargetTile = observer(
  React.forwardRef<HTMLDivElement, React.PropsWithChildren<TargetTileProps>>(
    ({ client, className, variant = 'small', children, ...props }, ref) => {
      const isSecure = connection.secure && !!client.publicKey;
      const isLocal = client.isLocal;
      const displayIcons = settingsStore.settings.displayIcons;
      const avatar = (client.clientName || '?')[0].toUpperCase();

      const getDeviceIcon = () => {
        switch (client.deviceType) {
          case DeviceType.MOBILE:
            return <IoPhonePortraitOutline className={styles.device} title="Mobile" />;
          case DeviceType.TABLET:
            return <IoTabletPortraitOutline className={styles.device} title="Tablet" />;
          case DeviceType.DESKTOP:
          default:
            return <IoDesktopOutline className={styles.device} title="Desktop" />;
        }
      };

      return (
        <div
          className={clsx(
            styles.tile,
            styles[variant],
            { [styles.everyone]: client.clientId === 'everyone' },
            className
          )}
          style={{
            backgroundColor:
              client.clientId !== 'everyone'
                ? uuidToColor(client.clientId)
                : undefined,
          }}
          ref={ref}
          {...props}
        >
          <span className={styles.avatar}>{avatar}</span>
          {variant === 'big' && displayIcons && (
            <div className={styles.badges}>
              {isLocal && (
                <span className={styles.localBadge} title="Local Network">
                  <IoWifiOutline /> LAN
                </span>
              )}
              <div className={styles.icons}>
                {isSecure && <IoLockClosed className={styles.secure} title="Encrypted" />}
                {getDeviceIcon()}
              </div>
            </div>
          )}
          {children}
        </div>
      );
    }
  )
);
