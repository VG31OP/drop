import {
  MessageModel,
  NetworkMessageModel,
  TargetedMessageModel,
  MessageType,
  ClientModel,
  AppInfoMessageModel,
  ClientInfoMessageModel,
  PingMessageModel,
  PublicRoomModel,
  PublicRoomsMessageModel,
  DisconnectedMessageModel,
  ErrorMessageModel,
} from '@filedrop/types';

import { Client } from './types/Client.js';
import { rtcConfiguration } from './utils/rtcConfiguration.js';
import {
  isNetworkNameMessageModel,
  isClientNameMessageModel,
  isTransferMessageModel,
  isActionMessageModel,
  isRTCDescriptionMessageModel,
  isRTCCandidateMessageModel,
  isEncryptedMessageModel,
  isInitializeMessageModel,
  isChatMessageModel,
  isMakePublicMessageModel,
} from './utils/validation.js';
import {
  abuseEmail,
  appName,
  maxNetworkClients,
  maxSize,
  noticeText,
  noticeUrl,
  requireCrypto,
} from './config.js';
import { secretToId } from './utils/id.js';

export class ClientManager {
  private clients = new Set<Client>();

  constructor() {
    this.sendNetworkMessage = this.sendNetworkMessage.bind(this);
  }

  sendAppInfo(client: Client) {
    const message: AppInfoMessageModel = {
      type: MessageType.APP_INFO,
      remoteAddress: client.remoteAddress,
      maxSize,
      noticeText,
      noticeUrl,
      appName,
      abuseEmail,
      requireCrypto,
    };

    client.send(message);
  }

  handleMessage(client: Client, message: MessageModel) {
    client.lastSeen = new Date();

    if (isInitializeMessageModel(message)) {
      if (client.initialized) {
        return;
      }

      if (!message.publicKey && requireCrypto) {
        this.disconnectClient(client, 'cryptoRequired');
        return;
      }

      client.initialized = true;
      client.secret = message.secret;
      client.clientId = secretToId(client.secret);
      client.publicKey = message.publicKey;

      this.clients.add(client);

      const clientInfoMessage: ClientInfoMessageModel = {
        type: MessageType.CLIENT_INFO,
        clientId: client.clientId,
        suggestedClientName: client.clientName,
        publicRooms: this.getPublicRooms(),
        rtcConfiguration: rtcConfiguration(client.clientId),
      };
      client.send(clientInfoMessage);

      return;
    }

    if (!client.initialized || !client.clientId) {
      return;
    }

    if (isNetworkNameMessageModel(message)) {
      const name = message.networkName.toUpperCase();
      const currentNetworkClients = this.getNetworkClients(name);
      const isAlreadyInNetwork = currentNetworkClients.some(
        c => c.clientId === client.clientId
      );

      if (!isAlreadyInNetwork && currentNetworkClients.length >= maxNetworkClients) {
        this.sendError(client, 'network', 'networkFull');
        return;
      }

      client.deviceType = message.deviceType;
      this.setNetworkName(client, name);
    } else if (isMakePublicMessageModel(message)) {
      client.isPublic = !!message.value;
      this.sendPublicRoomsMessage();
    } else if (isClientNameMessageModel(message)) {
      const trimmedName = message.clientName.trim();
      if (!trimmedName) return;

      const matchingClients = [...this.clients].filter(
        c => c.clientId === client.clientId
      );

      for (const targetClient of matchingClients) {
        targetClient.clientName = trimmedName;

        if (targetClient.networkName) {
          this.setNetworkName(targetClient, targetClient.networkName);
        }
      }
    } else if (requireCrypto && !isEncryptedMessageModel(message)) {
      // Ignore unencrypted messages when running with required E2E crypto.
    } else if (
      isActionMessageModel(message) ||
      isRTCDescriptionMessageModel(message) ||
      isRTCCandidateMessageModel(message) ||
      isEncryptedMessageModel(message) ||
      isTransferMessageModel(message) ||
      isChatMessageModel(message)
    ) {
      this.sendMessage(client, message);
    }
  }

  disconnectClient(client: Client, reason: string) {
    const message: DisconnectedMessageModel = {
      type: MessageType.DISCONNECTED,
      reason,
    };
    client.send(message);
    client.close();
    this.removeClient(client);
  }

  sendError(client: Client, mode: ErrorMessageModel['mode'], reason: string) {
    const message: ErrorMessageModel = {
      type: MessageType.ERROR,
      mode,
      reason,
    };
    client.send(message);
  }

  sendMessage(client: Client, message: TargetedMessageModel) {
    if (
      !message.targetId ||
      !client.clientId ||
      message.targetId === client.clientId ||
      !client.networkName
    ) {
      return;
    }

    const data = {
      ...message,
      clientId: client.clientId,
    };

    const targets = [...this.clients].filter(
      c => c.clientId === message.targetId && c.networkName === client.networkName
    );
    this.broadcast(data, targets);
  }

  getNetworkClients(networkName: string): Client[] {
    const clients = [...this.clients].filter(
      client => client.networkName === networkName
    );

    const uniqueClients: Client[] = [];

    for (const client of clients) {
      if (!uniqueClients.find(c => c.clientId === client.clientId)) {
        uniqueClients.push(client);
      }
    }

    uniqueClients.sort((a, b) => b.firstSeen.getTime() - a.firstSeen.getTime());

    return uniqueClients;
  }

  getPublicRooms(): PublicRoomModel[] {
    const publicNetworks = new Set<string>();
    const networkClientsMap = new Map<string, Set<string>>();

    for (const client of this.clients) {
      if (!client.networkName || !client.clientId) continue;

      if (!networkClientsMap.has(client.networkName)) {
        networkClientsMap.set(client.networkName, new Set());
      }
      networkClientsMap.get(client.networkName)!.add(client.clientId);

      if (client.isPublic) {
        publicNetworks.add(client.networkName);
      }
    }

    const rooms: PublicRoomModel[] = [...publicNetworks.values()].map(name => ({
      name,
      clients: networkClientsMap.get(name)?.size || 0,
    }));

    rooms.sort((a, b) => b.clients - a.clients || a.name.localeCompare(b.name));
    return rooms;
  }

  sendPublicRoomsMessage() {
    const publicRoomsMessage: PublicRoomsMessageModel = {
      type: MessageType.PUBLIC_ROOMS,
      publicRooms: this.getPublicRooms(),
    };

    this.broadcast(publicRoomsMessage);
  }

  sendNetworkMessage(networkName: string) {
    const networkClients = this.getNetworkClients(networkName);

    networkClients.forEach(client => {
      try {
        const clients: ClientModel[] = networkClients.map(otherClient => {
          return {
            clientId: otherClient.clientId!,
            clientName: otherClient.clientName,
            publicKey: otherClient.publicKey,
            isLocal: otherClient.remoteAddress === client.remoteAddress,
            deviceType: otherClient.deviceType,
          };
        });

        const networkMessage: NetworkMessageModel = {
          type: MessageType.NETWORK,
          clients,
        };

        client.send(networkMessage);
      } catch {}
    });
  }

  setNetworkName(client: Client, networkName?: string) {
    const previousNetworkName = client.networkName;
    client.networkName = networkName;

    if (previousNetworkName && previousNetworkName !== networkName) {
      this.sendNetworkMessage(previousNetworkName);
    }

    if (networkName) {
      this.sendNetworkMessage(networkName);
    }
    this.sendPublicRoomsMessage();
  }

  broadcast(message: MessageModel, clients?: Client[]) {
    if (!clients) {
      clients = [...this.clients];
    }
    const data = JSON.stringify(message);

    for (const client of clients) {
      try {
        client.sendRaw(data);
      } catch {
        this.removeClient(client);
        client.close();
      }
    }
  }

  pingClients() {
    const pingMessage: PingMessageModel = {
      type: MessageType.PING,
      timestamp: new Date().getTime(),
    };

    this.broadcast(pingMessage);
  }

  removeClient(client: Client) {
    this.setNetworkName(client, undefined);
    this.clients.delete(client);
  }

  removeBrokenClients() {
    for (const client of this.clients) {
      if (client.readyState <= 1) {
        continue;
      }

      this.setNetworkName(client, undefined);
      this.clients.delete(client);
    }
  }

  removeInactiveClients() {
    const minuteAgo = new Date(Date.now() - 1000 * 20);

    this.clients.forEach(client => {
      if (client.readyState !== 1) return;

      if (client.lastSeen < minuteAgo) {
        this.removeClient(client);
        client.close();
      }
    });
  }
}
