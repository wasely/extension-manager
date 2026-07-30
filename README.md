# Extension Manager

A lightweight Manifest V3 Chrome extension for managing installed extensions without opening `chrome://extensions`.

## Planned features

- Searchable dashboard of installed extensions
- Development/unpacked extension highlighting
- One-click reload with visual feedback
- Enable/disable toggle
- Name, version, icon, and extension ID display
- Responsive dark/light interface with smooth loading states

## Required Chrome APIs

- `chrome.management.getAll()`
- `chrome.management.reload(id)`
- `chrome.management.setEnabled(id, enabled)`

The extension will request the `management` permission in a Manifest V3 manifest.

Implementation requirements are still being gathered.
