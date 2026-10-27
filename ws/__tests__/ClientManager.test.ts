import {
  ActionMessageActionType,
  ActionMessageModel,
  MessageType,
  InitializeMessageModel,
  NetworkNameMessageModel,
  MakePublicMessageModel,
  TargetedMessageModel,
  ClientNameMessageModel,
} from '@filedrop/types';

import { ClientManager } from '../src/ClientManager.js';
import { Client } from '../src/types/Client.js';
import { generateClientName } from '../src/utils/name.js';

export class TestClient implements Client {
  clientName = generateClientName();
  readonly firstSeen = new Date();
  lastSeen = new Date();
  remoteAddress?: string = undefined;
  networkName?: string = undefined;
  isPublic = false;
  messages: any[] = [];
  lastMessage = '{}';
  closed = false;
  readyState = 1;
  clientId?: string;
  secret?: string;
  initialized = false;

  send(message: any) {
    this.messages.push(message);
    this.lastMessage = JSON.stringify(message);
  }

  sendRaw(data: string) {
    try {
      this.messages.push(JSON.parse(data));
    } catch {}
    this.lastMessage = data;
  }

  findLastMessage(type: MessageType) {
    return this.messages.filter(m => m.type === type).pop();
  }

  close() {
    this.closed = true;
  }
}

describe('ClientManager', () => {
  it('welcomes the client', async () => {
    const clientManager = new ClientManager();

    const client = new TestClient();
    clientManager.sendAppInfo(client);

    expect(JSON.parse(client.lastMessage)).toMatchObject({
      type: MessageType.APP_INFO,
    });

    clientManager.handleMessage(client, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC',
    } as InitializeMessageModel);

    expect(JSON.parse(client.lastMessage)).toMatchObject({
      type: MessageType.CLIENT_INFO,
      clientId: client.clientId,
      suggestedClientName: client.clientName,
    });
  });

  it('keeps track of local clients', async () => {
    const clientManager = new ClientManager();

    const client1 = new TestClient();
    client1.remoteAddress = '127.0.0.1';
    clientManager.handleMessage(client1, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC1',
    } as InitializeMessageModel);
    clientManager.handleMessage(client1, {
      type: MessageType.NETWORK_NAME,
      networkName: 'TEST',
    } as NetworkNameMessageModel);

    const client2 = new TestClient();
    client2.remoteAddress = '192.168.1.50';
    clientManager.handleMessage(client2, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC2',
    } as InitializeMessageModel);
    clientManager.handleMessage(client2, {
      type: MessageType.NETWORK_NAME,
      networkName: 'TEST',
    } as NetworkNameMessageModel);

    const client3 = new TestClient();
    client3.remoteAddress = '127.0.0.1';
    clientManager.handleMessage(client3, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC3',
    } as InitializeMessageModel);
    clientManager.handleMessage(client3, {
      type: MessageType.NETWORK_NAME,
      networkName: 'TEST',
    } as NetworkNameMessageModel);

    const msg1 = client1.findLastMessage(MessageType.NETWORK);
    expect(msg1).toBeDefined();
    const peer1 = msg1.clients.find((c: any) => c.clientId === client1.clientId);
    const peer2From1 = msg1.clients.find((c: any) => c.clientId === client2.clientId);
    const peer3From1 = msg1.clients.find((c: any) => c.clientId === client3.clientId);

    expect(peer1.isLocal).toBe(true);
    expect(peer3From1.isLocal).toBe(true);
    expect(peer2From1.isLocal).toBe(false);

    const msg2 = client2.findLastMessage(MessageType.NETWORK);
    expect(msg2).toBeDefined();
    const peer1From2 = msg2.clients.find((c: any) => c.clientId === client1.clientId);
    const peer2From2 = msg2.clients.find((c: any) => c.clientId === client2.clientId);
    expect(peer2From2.isLocal).toBe(true);
    expect(peer1From2.isLocal).toBe(false);
  });

  it('pings clients', async () => {
    const clientManager = new ClientManager();

    const client1 = new TestClient();
    clientManager.handleMessage(client1, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC1',
    } as InitializeMessageModel);

    const client2 = new TestClient();
    clientManager.handleMessage(client2, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC2',
    } as InitializeMessageModel);

    const client3 = new TestClient();
    clientManager.handleMessage(client3, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC3',
    } as InitializeMessageModel);

    clientManager.pingClients();

    expect(JSON.parse(client1.lastMessage)).toMatchObject({
      type: MessageType.PING,
    });
    expect(JSON.parse(client2.lastMessage)).toMatchObject({
      type: MessageType.PING,
    });
    expect(JSON.parse(client3.lastMessage)).toMatchObject({
      type: MessageType.PING,
    });
  });

  it('relays messages to target clients in the same network', async () => {
    const clientManager = new ClientManager();

    const client1 = new TestClient();
    clientManager.handleMessage(client1, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC1',
    } as InitializeMessageModel);
    clientManager.handleMessage(client1, {
      type: MessageType.NETWORK_NAME,
      networkName: 'ROOM1',
    } as NetworkNameMessageModel);

    const client2 = new TestClient();
    clientManager.handleMessage(client2, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC2',
    } as InitializeMessageModel);
    clientManager.handleMessage(client2, {
      type: MessageType.NETWORK_NAME,
      networkName: 'ROOM1',
    } as NetworkNameMessageModel);

    const targetedMessage: ActionMessageModel = {
      type: MessageType.ACTION,
      action: ActionMessageActionType.ACCEPT,
      targetId: client2.clientId!,
      transferId: 'ay3UIn8k4QsznfyHCt9mh',
    };

    clientManager.handleMessage(client1, targetedMessage);

    expect(JSON.parse(client2.lastMessage)).toMatchObject({
      type: MessageType.ACTION,
      clientId: client1.clientId,
      transferId: 'ay3UIn8k4QsznfyHCt9mh',
    });
  });

  it('enforces room isolation across different networks', async () => {
    const clientManager = new ClientManager();

    const client1 = new TestClient();
    clientManager.handleMessage(client1, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC1',
    } as InitializeMessageModel);
    clientManager.handleMessage(client1, {
      type: MessageType.NETWORK_NAME,
      networkName: 'ROOM1',
    } as NetworkNameMessageModel);

    const client2 = new TestClient();
    clientManager.handleMessage(client2, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC2',
    } as InitializeMessageModel);
    clientManager.handleMessage(client2, {
      type: MessageType.NETWORK_NAME,
      networkName: 'ROOM2',
    } as NetworkNameMessageModel);

    const initialMessage = client2.lastMessage;

    const targetedMessage: ActionMessageModel = {
      type: MessageType.ACTION,
      action: ActionMessageActionType.ACCEPT,
      targetId: client2.clientId!,
      transferId: 'ay3UIn8k4QsznfyHCt9mh',
    };

    clientManager.handleMessage(client1, targetedMessage);

    // client2 should NOT receive the message because it is in a different room
    expect(client2.lastMessage).toBe(initialMessage);
  });

  it('manages public rooms and makePublic toggles', async () => {
    const clientManager = new ClientManager();

    const client1 = new TestClient();
    clientManager.handleMessage(client1, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC1',
    } as InitializeMessageModel);
    clientManager.handleMessage(client1, {
      type: MessageType.NETWORK_NAME,
      networkName: 'PUBLIC1',
    } as NetworkNameMessageModel);

    expect(clientManager.getPublicRooms()).toHaveLength(0);

    clientManager.handleMessage(client1, {
      type: MessageType.MAKE_PUBLIC,
      value: true,
    } as MakePublicMessageModel);

    const rooms = clientManager.getPublicRooms();
    expect(rooms).toHaveLength(1);
    expect(rooms[0]).toEqual({
      name: 'PUBLIC1',
      clients: 1,
    });
  });

  it('drops invalid messages', async () => {
    const clientManager = new ClientManager();

    const client1 = new TestClient();
    clientManager.handleMessage(client1, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC1',
    } as InitializeMessageModel);

    const client2 = new TestClient();
    clientManager.handleMessage(client2, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC2',
    } as InitializeMessageModel);

    const targetedMessage: TargetedMessageModel = {
      type: MessageType.ACTION,
      targetId: client2.clientId!,
    };

    clientManager.handleMessage(client1, targetedMessage);

    expect(JSON.parse(client2.lastMessage)).toMatchObject({
      type: MessageType.CLIENT_INFO,
    });
  });

  it('cleans up inactive clients', async () => {
    const clientManager = new ClientManager();

    const client = new TestClient();
    clientManager.handleMessage(client, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC1',
    } as InitializeMessageModel);

    // Set lastSeen to 30 seconds ago
    client.lastSeen = new Date(Date.now() - 30000);

    clientManager.removeInactiveClients();
    expect(client.closed).toBe(true);
  });

  it('cleans up broken clients', async () => {
    const clientManager = new ClientManager();

    const client = new TestClient();
    clientManager.handleMessage(client, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC1',
    } as InitializeMessageModel);

    // readyState > 1 indicates closing/closed
    client.readyState = 2;

    clientManager.removeBrokenClients();
    expect(client.networkName).toBeUndefined();
  });

  it('trims client names and ignores empty whitespace names', async () => {
    const clientManager = new ClientManager();

    const client = new TestClient();
    clientManager.handleMessage(client, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC1',
    } as InitializeMessageModel);

    const initialName = client.clientName;

    // Sending whitespace should be ignored
    clientManager.handleMessage(client, {
      type: MessageType.CLIENT_NAME,
      clientName: '   ',
    } as ClientNameMessageModel);
    expect(client.clientName).toBe(initialName);

    // Sending trimmed name
    clientManager.handleMessage(client, {
      type: MessageType.CLIENT_NAME,
      clientName: '  Cool Device  ',
    } as ClientNameMessageModel);
    expect(client.clientName).toBe('Cool Device');
  });
});
