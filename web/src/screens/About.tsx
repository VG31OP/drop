import React from 'react';

import { Link } from '../components/Link.js';
import { TextSection } from '../components/TextSection.js';

export const About: React.FC = () => {
  return (
    <TextSection>
      <h2>Welcome</h2>
      <p>Welcome to FileDrop by Vraj Shiroya.</p>
      <p>
        FileDrop lets you securely transfer files over the network. If both
        devices support direct WebRTC, transfer stays peer-to-peer. Otherwise,
        relay fallback is used to keep transfers working.
      </p>
      <p>You can start a file transfer in a few easy steps:</p>
      <ol>
        <li>Open this website on one device (you're here right now!)</li>
        <li>
          Scan the QR code or open the URL from the "Invite" section on another
          device.
        </li>
        <li>
          Drag and drop your files onto a tile (any tile that isn't marked as
          "You", you can also click on a tile to open a file selection dialog).
        </li>
        <li>Accept the transfer on another device.</li>
      </ol>
      <p>FileDrop is open source.</p>
      <p>
        <a href="https://github.com/VG31OP/drop">
          The code is available on GitHub.
        </a>
      </p>
      <p>
        If you find this useful, star the repository and contribute fixes or
        improvements.
      </p>
      <p>
        Contact: <a href="mailto:vraj@shiroya.in">vraj@shiroya.in</a>
      </p>
      <p>
        Website: <a href="https://drop.shiroya.in">drop.shiroya.in</a>
      </p>
      <p>
        By interacting with the service you accept our{' '}
        <Link to="/privacy">Privacy Policy</Link> and{' '}
        <Link to="/tos">Terms of Service</Link>.
      </p>
    </TextSection>
  );
};

export default About;
