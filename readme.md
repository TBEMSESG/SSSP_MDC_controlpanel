# Touchscreen Button Configuration Interface

This project provides a local web-based interface for configuring a set of touchscreen buttons. The configuration is stored on the device and persists across reboots as long as the app is installed.

## 🤩 Features

- Visual editor for up to 10 customizable buttons
- Supports name, color, image, connection type, target IP, port, and command
- Button layout auto-hides buttons with no name
- Live button preview with color and image
- Background image uploader for each button (roadmap)
- Configuration is editable in-browser and saved directly to the device
- Persists across device restarts
- Fully responsive layout

## 🚀 Getting Started

### 1. Clone / Install the Project

> tbc

### 2. Start the Server

> tbc

- Web interface runs on: `http://<device-ip>:3000/`
- Settings are editable in your browser

---

## ⚙️ Configuration Format

Config is stored in memory and optionally saved to disk in JSON format:

```json
{
  "buttonsQty": 8,
  "buttonsSettings": {
    "Button1": {
      "name": "Power Off",
      "backgroundColor": "red",
      "backgroundImage": "",
      "connectionType": "udp",
      "connectionPort": 1515,
      "connectionTarget": ["10.10.1.10"],
      "connectionCommand": "AA01XXxxxx"
    }
    // ... Button2 to Button8
  }
}
```

---

## 🖼️ Image Upload


> tbc

- Each button allows uploading a background image (base64 encoded).
- Images are previewed live in the interface.
- Stored inline as part of the config JSON.

---

## ✨ Touchscreen Layout

- Buttons are displayed in a fullscreen grid.
- Uses CSS Grid for balanced distribution.
- Empty-name buttons are hidden automatically.
- Style is responsive and clean by default.

---

## 🥪 Notes

- Supports for TCP and UDP connections
- Data is **not lost** on reboot unless the app is uninstalled.
- No database needed — all local.

---

## 🧰 File Structure

> tbc

---

## 📱 Usage Instructions

1. Open the settings page in your browser.
2. Modify button name, color, connection type, and optionally upload an image.
3. Click **Save Changes** to apply.
4. Buttons with an empty name will be hidden from the touchscreen UI.

---

## 💡 TODO

- [x] Add TCP connection support
- [x] Persist configuration to a file on disk
- [ ] Add drag-and-drop button reordering
- [ ] Improve image handling (size limit, compression)
- [ ] Add language and accessibility options

---

## 📄 License

MIT License

---

## 🤝 Contributing

Pull requests welcome! Let me know if you want to add features like animation, audio triggers, or remote syncing.

