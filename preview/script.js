/* ╔══════════════════════════════════════════════════════════════╗
   ║            DevShakti OS — Desktop Preview Script            ║
   ╚══════════════════════════════════════════════════════════════╝ */

// ═══════════════════════════════════════════════════════════
// State
// ═══════════════════════════════════════════════════════════

let windowZIndex = 100;
const windowStates = {};         // { id: { open, minimized, maximized, prevBounds } }
const windowDefaults = {
  files:    { top: 60, left: 80,  width: 780, height: 500 },
  terminal: { top: 100, left: 160, width: 720, height: 440 },
  settings: { top: 80,  left: 200, width: 800, height: 520 },
  firefox:  { top: 50,  left: 120, width: 860, height: 560 },
  winapps:  { top: 90,  left: 240, width: 680, height: 480 },
  appstore: { top: 60,  left: 140, width: 760, height: 540 },
};

// ═══════════════════════════════════════════════════════════
// Clock
// ═══════════════════════════════════════════════════════════

function updateClock() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const mins  = now.getMinutes().toString().padStart(2, '0');
  const secs  = now.getSeconds().toString().padStart(2, '0');

  const clockEl = document.getElementById('menuClock');
  const dateEl  = document.getElementById('menuDate');

  if (clockEl) clockEl.textContent = `${hours}:${mins}:${secs}`;
  if (dateEl) {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString('en-US', options);
  }
}

setInterval(updateClock, 1000);
updateClock();

// ═══════════════════════════════════════════════════════════
// Window Management
// ═══════════════════════════════════════════════════════════

function getWindowEl(id) {
  return document.getElementById(`window-${id}`);
}

function initWindowState(id) {
  if (!windowStates[id]) {
    windowStates[id] = { open: false, minimized: false, maximized: false, prevBounds: null };
  }
}

function openWindow(id) {
  initWindowState(id);
  const state = windowStates[id];
  const win   = getWindowEl(id);
  if (!win) return;

  // If already open but minimized, restore
  if (state.open && state.minimized) {
    restoreWindow(id);
    return;
  }

  // If already open, just bring to front
  if (state.open) {
    bringToFront(id);
    return;
  }

  // Position window
  const def = windowDefaults[id] || { top: 100, left: 100, width: 700, height: 450 };
  win.style.top    = def.top + 'px';
  win.style.left   = def.left + 'px';
  win.style.width  = def.width + 'px';
  win.style.height = def.height + 'px';

  state.open      = true;
  state.minimized = false;
  state.maximized = false;

  win.classList.remove('minimizing');
  win.classList.add('open', 'opening');
  win.style.zIndex = ++windowZIndex;

  // Remove opening animation class after it finishes
  setTimeout(() => win.classList.remove('opening'), 350);

  // Dock bounce
  bounceDockIcon(id);

  // Update dock indicator
  updateDockIndicators();

  // Special init
  if (id === 'files')    populateFileManager('home');
  if (id === 'terminal') runNeofetch();
  if (id === 'settings') populateSettings('appearance');
}

function closeWindow(id) {
  initWindowState(id);
  const state = windowStates[id];
  const win   = getWindowEl(id);
  if (!win) return;

  // Animate out
  win.style.transition = 'opacity 0.25s ease-in, transform 0.25s ease-in';
  win.style.opacity = '0';
  win.style.transform = 'scale(0.9)';

  setTimeout(() => {
    win.classList.remove('open', 'maximized');
    win.style.transition = '';
    win.style.opacity = '';
    win.style.transform = '';
    state.open      = false;
    state.minimized = false;
    state.maximized = false;
    updateDockIndicators();
  }, 250);
}

function minimizeWindow(id) {
  initWindowState(id);
  const state = windowStates[id];
  const win   = getWindowEl(id);
  if (!win) return;

  state.minimized = true;
  win.classList.add('minimizing');

  setTimeout(() => {
    win.classList.remove('open', 'maximized', 'minimizing');
    win.style.opacity = '';
    win.style.transform = '';
  }, 300);

  updateDockIndicators();
}

function restoreWindow(id) {
  initWindowState(id);
  const state = windowStates[id];
  const win   = getWindowEl(id);
  if (!win) return;

  state.minimized = false;
  win.classList.remove('minimizing');
  win.classList.add('open', 'opening');
  win.style.zIndex = ++windowZIndex;

  setTimeout(() => win.classList.remove('opening'), 350);
  updateDockIndicators();
}

function maximizeWindow(id) {
  initWindowState(id);
  const state = windowStates[id];
  const win   = getWindowEl(id);
  if (!win) return;

  if (state.maximized) {
    // Restore
    win.classList.remove('maximized');
    if (state.prevBounds) {
      win.style.top    = state.prevBounds.top;
      win.style.left   = state.prevBounds.left;
      win.style.width  = state.prevBounds.width;
      win.style.height = state.prevBounds.height;
    }
    state.maximized = false;
  } else {
    // Save current bounds
    state.prevBounds = {
      top:    win.style.top,
      left:   win.style.left,
      width:  win.style.width,
      height: win.style.height,
    };
    state.maximized = true;
    win.classList.add('maximized');
  }

  bringToFront(id);
}

function bringToFront(id) {
  const win = getWindowEl(id);
  if (win) {
    win.style.zIndex = ++windowZIndex;
  }
}

function updateDockIndicators() {
  document.querySelectorAll('.dock-indicator[data-indicator]').forEach(dot => {
    const wId = dot.dataset.indicator;
    initWindowState(wId);
    const state = windowStates[wId];
    if (state.open) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

function bounceDockIcon(id) {
  const dockItem = document.querySelector(`.dock-item[data-window="${id}"]`);
  if (!dockItem) return;
  dockItem.classList.add('bouncing');
  setTimeout(() => dockItem.classList.remove('bouncing'), 600);
}

// ═══════════════════════════════════════════════════════════
// Window Dragging
// ═══════════════════════════════════════════════════════════

let dragState = null;

document.addEventListener('mousedown', (e) => {
  const titlebar = e.target.closest('[data-draggable="true"]');
  if (!titlebar) return;
  // Don't drag if clicking traffic light buttons
  if (e.target.closest('.tl-btn')) return;

  const win = titlebar.closest('.window');
  if (!win) return;

  const winId = win.dataset.windowId;
  initWindowState(winId);

  // Don't drag if maximized
  if (windowStates[winId].maximized) return;

  bringToFront(winId);

  const rect = win.getBoundingClientRect();
  dragState = {
    win,
    startX: e.clientX,
    startY: e.clientY,
    origLeft: rect.left,
    origTop: rect.top,
  };

  e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
  if (!dragState) return;
  const dx = e.clientX - dragState.startX;
  const dy = e.clientY - dragState.startY;
  dragState.win.style.left = (dragState.origLeft + dx) + 'px';
  dragState.win.style.top  = (dragState.origTop + dy) + 'px';
});

document.addEventListener('mouseup', () => {
  dragState = null;
});

// Click window to bring to front
document.addEventListener('mousedown', (e) => {
  const win = e.target.closest('.window');
  if (win) {
    const winId = win.dataset.windowId;
    if (winId) bringToFront(winId);
  }
});

// ═══════════════════════════════════════════════════════════
// Dock Magnification
// ═══════════════════════════════════════════════════════════

const dockContainer = document.getElementById('dockContainer');
const dockItems = dockContainer ? dockContainer.querySelectorAll('.dock-item') : [];

function handleDockMouseMove(e) {
  const dockRect = dockContainer.getBoundingClientRect();
  const mouseX = e.clientX;

  dockItems.forEach(item => {
    const itemRect = item.getBoundingClientRect();
    const itemCenterX = itemRect.left + itemRect.width / 2;
    const dist = Math.abs(mouseX - itemCenterX);

    const maxDist = 120;
    const maxScale = 1.5;
    const minScale = 1;

    let scale;
    if (dist > maxDist) {
      scale = minScale;
    } else {
      const ratio = 1 - (dist / maxDist);
      scale = minScale + (maxScale - minScale) * Math.pow(ratio, 2);
    }

    const icon = item.querySelector('.dock-icon');
    if (icon) {
      icon.style.transform = `scale(${scale})`;
    }
  });
}

function handleDockMouseLeave() {
  dockItems.forEach(item => {
    const icon = item.querySelector('.dock-icon');
    if (icon) {
      icon.style.transform = 'scale(1)';
    }
  });
}

if (dockContainer) {
  dockContainer.addEventListener('mousemove', handleDockMouseMove);
  dockContainer.addEventListener('mouseleave', handleDockMouseLeave);
}

// ═══════════════════════════════════════════════════════════
// Context Menu
// ═══════════════════════════════════════════════════════════

const contextMenu = document.getElementById('contextMenu');

document.getElementById('desktop').addEventListener('contextmenu', (e) => {
  e.preventDefault();
  // Don't show context menu if clicking on a window
  if (e.target.closest('.window') || e.target.closest('#dock')) return;

  contextMenu.style.left = e.clientX + 'px';
  contextMenu.style.top  = e.clientY + 'px';

  // Ensure menu stays within viewport
  contextMenu.classList.add('show');
  const menuRect = contextMenu.getBoundingClientRect();
  if (menuRect.right > window.innerWidth) {
    contextMenu.style.left = (e.clientX - menuRect.width) + 'px';
  }
  if (menuRect.bottom > window.innerHeight) {
    contextMenu.style.top = (e.clientY - menuRect.height) + 'px';
  }
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.context-menu')) {
    contextMenu.classList.remove('show');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    contextMenu.classList.remove('show');
    closeAboutModal();
  }
});

function handleContextAction(action) {
  contextMenu.classList.remove('show');
  switch (action) {
    case 'wallpaper':
      openWindow('settings');
      break;
    case 'refresh':
      document.getElementById('desktop').style.opacity = '0.7';
      setTimeout(() => document.getElementById('desktop').style.opacity = '1', 300);
      break;
    case 'display':
      openWindow('settings');
      break;
    case 'terminal':
      openWindow('terminal');
      break;
    case 'about':
      showAboutModal();
      break;
  }
}

// ═══════════════════════════════════════════════════════════
// About Modal
// ═══════════════════════════════════════════════════════════

function showAboutModal() {
  const overlay = document.getElementById('aboutOverlay');
  overlay.style.display = 'flex';
  // Force reflow for animation
  overlay.offsetHeight;
  overlay.classList.add('show');
}

function closeAboutModal() {
  const overlay = document.getElementById('aboutOverlay');
  overlay.classList.remove('show');
  setTimeout(() => { overlay.style.display = 'none'; }, 300);
}

// Close modal on overlay click
document.getElementById('aboutOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeAboutModal();
});

// ═══════════════════════════════════════════════════════════
// File Manager
// ═══════════════════════════════════════════════════════════

const fileData = {
  home: {
    path: '/home/user',
    items: [
      { name: 'Desktop',   icon: '🖥️', type: 'folder' },
      { name: 'Documents', icon: '📄', type: 'folder' },
      { name: 'Downloads', icon: '⬇️', type: 'folder' },
      { name: 'Music',     icon: '🎵', type: 'folder' },
      { name: 'Pictures',  icon: '🖼️', type: 'folder' },
      { name: 'Videos',    icon: '🎬', type: 'folder' },
      { name: '.bashrc',   icon: '📝', type: 'file' },
      { name: '.config',   icon: '⚙️', type: 'folder' },
    ]
  },
  desktop: {
    path: '/home/user/Desktop',
    items: [
      { name: 'Firefox.desktop',  icon: '🌐', type: 'file' },
      { name: 'Terminal.desktop', icon: '💻', type: 'file' },
      { name: 'README.md',       icon: '📝', type: 'file' },
      { name: 'Projects',        icon: '📁', type: 'folder' },
    ]
  },
  documents: {
    path: '/home/user/Documents',
    items: [
      { name: 'report.pdf',     icon: '📕', type: 'file' },
      { name: 'notes.txt',      icon: '📝', type: 'file' },
      { name: 'presentation.pptx', icon: '📊', type: 'file' },
      { name: 'Projects',       icon: '📁', type: 'folder' },
      { name: 'Work',           icon: '💼', type: 'folder' },
    ]
  },
  downloads: {
    path: '/home/user/Downloads',
    items: [
      { name: 'firefox-128.tar.bz2', icon: '📦', type: 'file' },
      { name: 'wallpaper.png',       icon: '🖼️', type: 'file' },
      { name: 'game-mod.zip',        icon: '🗜️', type: 'file' },
      { name: 'VSCode.deb',          icon: '📦', type: 'file' },
      { name: 'arch-wiki-offline.tar', icon: '📦', type: 'file' },
    ]
  },
  music: {
    path: '/home/user/Music',
    items: [
      { name: 'playlist.m3u', icon: '🎵', type: 'file' },
      { name: 'Favorites',    icon: '⭐', type: 'folder' },
      { name: 'Podcasts',     icon: '🎙️', type: 'folder' },
    ]
  },
  pictures: {
    path: '/home/user/Pictures',
    items: [
      { name: 'Screenshots',  icon: '📷', type: 'folder' },
      { name: 'Wallpapers',   icon: '🖼️', type: 'folder' },
      { name: 'avatar.png',   icon: '🖼️', type: 'file' },
      { name: 'photo-01.jpg', icon: '🖼️', type: 'file' },
    ]
  },
  videos: {
    path: '/home/user/Videos',
    items: [
      { name: 'screencast.mp4', icon: '🎬', type: 'file' },
      { name: 'tutorial.mkv',   icon: '🎬', type: 'file' },
      { name: 'Clips',          icon: '📁', type: 'folder' },
    ]
  },
  root: {
    path: '/',
    items: [
      { name: 'bin',  icon: '📁', type: 'folder' },
      { name: 'boot', icon: '📁', type: 'folder' },
      { name: 'dev',  icon: '📁', type: 'folder' },
      { name: 'etc',  icon: '📁', type: 'folder' },
      { name: 'home', icon: '📁', type: 'folder' },
      { name: 'lib',  icon: '📁', type: 'folder' },
      { name: 'mnt',  icon: '📁', type: 'folder' },
      { name: 'opt',  icon: '📁', type: 'folder' },
      { name: 'proc', icon: '📁', type: 'folder' },
      { name: 'root', icon: '📁', type: 'folder' },
      { name: 'tmp',  icon: '📁', type: 'folder' },
      { name: 'usr',  icon: '📁', type: 'folder' },
      { name: 'var',  icon: '📁', type: 'folder' },
    ]
  },
};

function populateFileManager(folder) {
  const data = fileData[folder];
  if (!data) return;

  const container = document.getElementById('fileContent');
  const pathEl    = document.getElementById('files-path');
  const statusEl  = document.getElementById('fileStatusLeft');

  pathEl.textContent = data.path;
  statusEl.textContent = `${data.items.length} items`;

  container.innerHTML = data.items.map(item => `
    <div class="file-item" onclick="selectFile(this)" ondblclick="openFileItem('${item.type}', '${item.name}')">
      <div class="file-item-icon">${item.icon}</div>
      <div class="file-item-name">${item.name}</div>
    </div>
  `).join('');
}

function navigateFolder(el, folder) {
  // Update sidebar active state
  el.closest('.file-sidebar').querySelectorAll('.sidebar-item').forEach(item => {
    item.classList.remove('active');
  });
  el.classList.add('active');
  populateFileManager(folder);
}

function selectFile(el) {
  el.closest('.file-content').querySelectorAll('.file-item').forEach(item => {
    item.classList.remove('selected');
  });
  el.classList.add('selected');
}

function openFileItem(type, name) {
  // Just visual feedback for now
  if (type === 'folder') {
    // Try to navigate
    const folderKey = name.toLowerCase();
    if (fileData[folderKey]) {
      populateFileManager(folderKey);
      // Update sidebar
      document.querySelectorAll('.file-sidebar .sidebar-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.folder === folderKey) item.classList.add('active');
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Terminal — Neofetch
// ═══════════════════════════════════════════════════════════

let neofetchRan = false;

function runNeofetch() {
  if (neofetchRan) return;
  neofetchRan = true;

  const output = document.getElementById('terminalOutput');
  output.innerHTML = '';

  const asciiLogo = [
    '        <span class="neofetch-logo">    ⚡⚡⚡    </span>',
    '        <span class="neofetch-logo">  ⚡     ⚡  </span>',
    '        <span class="neofetch-logo"> ⚡  DEV  ⚡ </span>',
    '        <span class="neofetch-logo"> ⚡ SHAKTI⚡ </span>',
    '        <span class="neofetch-logo">  ⚡     ⚡  </span>',
    '        <span class="neofetch-logo">    ⚡⚡⚡    </span>',
  ];

  const sysInfo = [
    '<span class="neofetch-label">user</span><span class="neofetch-accent">@</span><span class="neofetch-label">devshakti</span>',
    '──────────────────',
    '<span class="neofetch-label">OS</span>: <span class="neofetch-value">DevShakti OS 1.0 "Indra" x86_64</span>',
    '<span class="neofetch-label">Kernel</span>: <span class="neofetch-value">6.12.1-zen1-devshakti</span>',
    '<span class="neofetch-label">Uptime</span>: <span class="neofetch-value">3 hours, 42 mins</span>',
    '<span class="neofetch-label">Packages</span>: <span class="neofetch-value">1847 (pacman), 12 (flatpak)</span>',
    '<span class="neofetch-label">Shell</span>: <span class="neofetch-value">zsh 5.9</span>',
    '<span class="neofetch-label">Resolution</span>: <span class="neofetch-value">2560x1440 @ 165Hz</span>',
    '<span class="neofetch-label">DE</span>: <span class="neofetch-value">KDE Plasma 6.2</span>',
    '<span class="neofetch-label">WM</span>: <span class="neofetch-value">KWin (Wayland)</span>',
    '<span class="neofetch-label">Theme</span>: <span class="neofetch-value">DevShakti Blue [Plasma]</span>',
    '<span class="neofetch-label">Icons</span>: <span class="neofetch-value">Papirus-Light</span>',
    '<span class="neofetch-label">Terminal</span>: <span class="neofetch-value">Konsole</span>',
    '<span class="neofetch-label">CPU</span>: <span class="neofetch-value">AMD Ryzen 7 7445HS (8) @ 4.89GHz</span>',
    '<span class="neofetch-label">GPU</span>: <span class="neofetch-value">AMD Radeon 760M</span>',
    '<span class="neofetch-label">GPU</span>: <span class="neofetch-value">NVIDIA GeForce RTX 4050 Mobile</span>',
    '<span class="neofetch-label">Memory</span>: <span class="neofetch-value">4218MiB / 16384MiB</span>',
    '',
  ];

  // Merge ascii logo with sysInfo side by side
  const maxLines = Math.max(asciiLogo.length, sysInfo.length);
  const lines = [];

  // First line: the neofetch command
  lines.push('<span class="terminal-prompt">user@devshakti</span><span class="terminal-prompt-sep">:</span><span class="terminal-path">~</span><span class="terminal-prompt-dollar">$</span> neofetch');
  lines.push('');

  for (let i = 0; i < maxLines; i++) {
    const logo = asciiLogo[i] || '                        ';
    const info = sysInfo[i]   || '';
    lines.push(`${logo}    ${info}`);
  }

  // Color blocks at the end
  const colorBlocks = [
    '#0D1117', '#F85149', '#3FB950', '#D29922',
    '#58A6FF', '#BC8CFF', '#39C5CF', '#C9D1D9',
  ];
  const blockLine = colorBlocks.map(c =>
    `<span class="neofetch-color-block" style="background:${c}"></span>`
  ).join('');
  lines.push('                        ' + '    ' + blockLine);

  lines.push('');

  // Typing animation
  let lineIdx = 0;
  function typeLine() {
    if (lineIdx >= lines.length) return;
    output.innerHTML += lines[lineIdx] + '\n';
    lineIdx++;

    // Scroll to bottom
    const termBody = document.getElementById('terminalBody');
    if (termBody) termBody.scrollTop = termBody.scrollHeight;

    const delay = lineIdx <= 2 ? 60 : 25;
    setTimeout(typeLine, delay);
  }

  setTimeout(typeLine, 300);
}

// ═══════════════════════════════════════════════════════════
// Settings
// ═══════════════════════════════════════════════════════════

const settingsPages = {
  appearance: `
    <h2 class="settings-title">🎨 Global Theme</h2>
    <p class="settings-subtitle">Choose and customize your desktop theme</p>
    <div class="settings-group">
      <div class="settings-group-title">Theme</div>
      <div class="theme-cards">
        <div class="theme-card theme-card-blue active" onclick="selectTheme(this)">
          DevShakti Blue
        </div>
        <div class="theme-card theme-card-dark" onclick="selectTheme(this)">
          DevShakti Dark
        </div>
        <div class="theme-card theme-card-purple" onclick="selectTheme(this)">
          DevShakti Purple
        </div>
      </div>
    </div>
    <div class="settings-group">
      <div class="settings-group-title">Window Decorations</div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">Rounded Corners</div>
          <div class="settings-option-desc">Apply rounded corners to windows</div>
        </div>
        <div class="toggle-switch on" onclick="toggleSwitch(this)"></div>
      </div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">Blur Behind Windows</div>
          <div class="settings-option-desc">Enable backdrop blur effect</div>
        </div>
        <div class="toggle-switch on" onclick="toggleSwitch(this)"></div>
      </div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">Window Shadows</div>
          <div class="settings-option-desc">Show drop shadows under windows</div>
        </div>
        <div class="toggle-switch on" onclick="toggleSwitch(this)"></div>
      </div>
    </div>
  `,
  colors: `
    <h2 class="settings-title">🌈 Colors</h2>
    <p class="settings-subtitle">Accent color and color scheme preferences</p>
    <div class="settings-group">
      <div class="settings-group-title">Accent Color</div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">Accent Color</div>
          <div class="settings-option-desc">Used for highlights, buttons, and focus</div>
        </div>
        <div style="width:28px;height:28px;border-radius:50%;background:var(--accent);border:2px solid rgba(0,0,0,0.1);cursor:pointer;"></div>
      </div>
    </div>
    <div class="settings-group">
      <div class="settings-group-title">Color Scheme</div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">Prefer Dark Colors</div>
          <div class="settings-option-desc">Use dark color scheme for applications</div>
        </div>
        <div class="toggle-switch" onclick="toggleSwitch(this)"></div>
      </div>
    </div>
  `,
  fonts: `
    <h2 class="settings-title">🔤 Fonts</h2>
    <p class="settings-subtitle">Font configuration for the desktop</p>
    <div class="settings-group">
      <div class="settings-group-title">Font Settings</div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">General Font</div>
          <div class="settings-option-desc">Inter, 10pt</div>
        </div>
        <span style="color:var(--accent);cursor:pointer;font-weight:500;">Change</span>
      </div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">Fixed Width Font</div>
          <div class="settings-option-desc">JetBrains Mono, 10pt</div>
        </div>
        <span style="color:var(--accent);cursor:pointer;font-weight:500;">Change</span>
      </div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">Anti-Aliasing</div>
          <div class="settings-option-desc">Enable font anti-aliasing</div>
        </div>
        <div class="toggle-switch on" onclick="toggleSwitch(this)"></div>
      </div>
    </div>
  `,
  icons: `
    <h2 class="settings-title">📦 Icons</h2>
    <p class="settings-subtitle">Configure icon theme</p>
    <div class="settings-group">
      <div class="settings-group-title">Icon Theme</div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">Papirus-Light</div>
          <div class="settings-option-desc">Active icon theme</div>
        </div>
        <span style="color:var(--accent);font-weight:600;">✓ Active</span>
      </div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">Breeze</div>
          <div class="settings-option-desc">KDE default icon theme</div>
        </div>
        <span style="color:var(--text-muted);cursor:pointer;font-weight:500;">Apply</span>
      </div>
    </div>
  `,
  desktop: `
    <h2 class="settings-title">🖥️ Desktop</h2>
    <p class="settings-subtitle">Desktop behavior and layout</p>
    <div class="settings-group">
      <div class="settings-group-title">Desktop Behavior</div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">Show Desktop Icons</div>
          <div class="settings-option-desc">Display icons on the desktop</div>
        </div>
        <div class="toggle-switch on" onclick="toggleSwitch(this)"></div>
      </div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">Lock Widgets</div>
          <div class="settings-option-desc">Prevent widget modification</div>
        </div>
        <div class="toggle-switch on" onclick="toggleSwitch(this)"></div>
      </div>
    </div>
  `,
  wallpaper: `
    <h2 class="settings-title">🖼️ Wallpaper</h2>
    <p class="settings-subtitle">Desktop wallpaper settings</p>
    <div class="settings-group">
      <div class="settings-group-title">Current Wallpaper</div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">DevShakti Blue Waves</div>
          <div class="settings-option-desc">Default system wallpaper</div>
        </div>
        <span style="color:var(--accent);font-weight:600;">✓ Active</span>
      </div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">Positioning</div>
          <div class="settings-option-desc">Scaled and Cropped</div>
        </div>
        <span style="color:var(--accent);cursor:pointer;font-weight:500;">Change</span>
      </div>
    </div>
  `,
  effects: `
    <h2 class="settings-title">✨ Desktop Effects</h2>
    <p class="settings-subtitle">Window and compositing effects</p>
    <div class="settings-group">
      <div class="settings-group-title">Animation Speed</div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">Global Animation Speed</div>
          <div class="settings-option-desc">1x — Default</div>
        </div>
        <span style="color:var(--accent);cursor:pointer;font-weight:500;">Adjust</span>
      </div>
    </div>
    <div class="settings-group">
      <div class="settings-group-title">Effects</div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">Blur</div>
          <div class="settings-option-desc">Blur behind windows and panels</div>
        </div>
        <div class="toggle-switch on" onclick="toggleSwitch(this)"></div>
      </div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">Wobbly Windows</div>
          <div class="settings-option-desc">Windows wobble when moved</div>
        </div>
        <div class="toggle-switch" onclick="toggleSwitch(this)"></div>
      </div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">Magic Lamp</div>
          <div class="settings-option-desc">Minimize animation effect</div>
        </div>
        <div class="toggle-switch on" onclick="toggleSwitch(this)"></div>
      </div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">Slide Back</div>
          <div class="settings-option-desc">Slide windows when moving them</div>
        </div>
        <div class="toggle-switch on" onclick="toggleSwitch(this)"></div>
      </div>
    </div>
  `,
  display: `
    <h2 class="settings-title">🖥️ Display Configuration</h2>
    <p class="settings-subtitle">Monitor layout and resolution</p>
    <div class="settings-group">
      <div class="settings-group-title">Displays</div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">Built-in Display</div>
          <div class="settings-option-desc">2560×1440 @ 165Hz — Primary</div>
        </div>
        <span style="color:var(--tl-maximize);font-weight:600;">● Active</span>
      </div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">Night Color</div>
          <div class="settings-option-desc">Reduce blue light at night</div>
        </div>
        <div class="toggle-switch on" onclick="toggleSwitch(this)"></div>
      </div>
    </div>
    <div class="settings-group">
      <div class="settings-group-title">Scaling</div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">Global Scale</div>
          <div class="settings-option-desc">100% — Recommended</div>
        </div>
        <span style="color:var(--accent);cursor:pointer;font-weight:500;">Change</span>
      </div>
    </div>
  `,
  audio: `
    <h2 class="settings-title">🔊 Audio</h2>
    <p class="settings-subtitle">Audio devices and volume</p>
    <div class="settings-group">
      <div class="settings-group-title">Output</div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">Built-in Speakers</div>
          <div class="settings-option-desc">Realtek ALC287 — PipeWire</div>
        </div>
        <span style="color:var(--tl-maximize);font-weight:600;">● Active</span>
      </div>
    </div>
    <div class="settings-group">
      <div class="settings-group-title">Server</div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">Audio Server</div>
          <div class="settings-option-desc">PipeWire 1.0.5</div>
        </div>
        <span style="color:var(--accent);font-weight:500;">Running</span>
      </div>
    </div>
  `,
  gpu: `
    <h2 class="settings-title">🎮 GPU Configuration</h2>
    <p class="settings-subtitle">Graphics processing unit settings</p>
    <div class="settings-group">
      <div class="settings-group-title">GPUs Detected</div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">AMD Radeon 760M (Integrated)</div>
          <div class="settings-option-desc">amdgpu driver — Vulkan 1.3 / OpenGL 4.6</div>
        </div>
        <span style="color:var(--tl-maximize);font-weight:600;">● Active</span>
      </div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">NVIDIA GeForce RTX 4050 (Discrete)</div>
          <div class="settings-option-desc">nvidia 560.35 — PRIME Offload</div>
        </div>
        <span style="color:var(--accent);font-weight:600;">● Ready</span>
      </div>
    </div>
    <div class="settings-group">
      <div class="settings-group-title">Switching Mode</div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">PRIME Render Offload</div>
          <div class="settings-option-desc">Use iGPU by default, dGPU on demand</div>
        </div>
        <div class="toggle-switch on" onclick="toggleSwitch(this)"></div>
      </div>
    </div>
  `,
  about: `
    <h2 class="settings-title">ℹ️ About This System</h2>
    <p class="settings-subtitle">System information</p>
    <div class="settings-group">
      <div class="settings-group-title">System</div>
      <div class="settings-option">
        <div class="settings-option-label">Operating System</div>
        <div class="settings-option-desc">DevShakti OS 1.0 "Indra"</div>
      </div>
      <div class="settings-option">
        <div class="settings-option-label">Kernel</div>
        <div class="settings-option-desc">Linux 6.12.1-zen1-devshakti</div>
      </div>
      <div class="settings-option">
        <div class="settings-option-label">Desktop Environment</div>
        <div class="settings-option-desc">KDE Plasma 6.2 (Wayland)</div>
      </div>
      <div class="settings-option">
        <div class="settings-option-label">CPU</div>
        <div class="settings-option-desc">AMD Ryzen 7 7445HS (8 cores / 16 threads)</div>
      </div>
      <div class="settings-option">
        <div class="settings-option-label">Memory</div>
        <div class="settings-option-desc">16 GB DDR5-5600</div>
      </div>
      <div class="settings-option">
        <div class="settings-option-label">Graphics</div>
        <div class="settings-option-desc">AMD Radeon 760M + NVIDIA RTX 4050</div>
      </div>
    </div>
  `,
  updates: `
    <h2 class="settings-title">🔄 System Updates</h2>
    <p class="settings-subtitle">Keep your system up to date</p>
    <div class="settings-group">
      <div class="settings-group-title">Status</div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">System is up to date</div>
          <div class="settings-option-desc">Last checked: today, 10:30 AM</div>
        </div>
        <span style="color:var(--tl-maximize);font-weight:600;">✓</span>
      </div>
    </div>
    <div class="settings-group">
      <div class="settings-group-title">Update Preferences</div>
      <div class="settings-option">
        <div>
          <div class="settings-option-label">Automatic Updates</div>
          <div class="settings-option-desc">Check for updates daily</div>
        </div>
        <div class="toggle-switch on" onclick="toggleSwitch(this)"></div>
      </div>
    </div>
  `,
};

function populateSettings(page) {
  const content = document.getElementById('settingsContent');
  if (!content) return;
  content.innerHTML = settingsPages[page] || '<p>Settings page not found.</p>';
}

function navigateSettings(el, page) {
  el.closest('.settings-sidebar').querySelectorAll('.sidebar-item').forEach(item => {
    item.classList.remove('active');
  });
  el.classList.add('active');
  populateSettings(page);
}

function selectTheme(el) {
  el.closest('.theme-cards').querySelectorAll('.theme-card').forEach(card => {
    card.classList.remove('active');
  });
  el.classList.add('active');
}

function toggleSwitch(el) {
  el.classList.toggle('on');
}

// ═══════════════════════════════════════════════════════════
// Desktop Icon Selection
// ═══════════════════════════════════════════════════════════

document.querySelectorAll('.desktop-icon').forEach(icon => {
  icon.addEventListener('click', function (e) {
    // Deselect all
    document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
    this.classList.add('selected');
  });
});

// Deselect on desktop click
document.getElementById('desktop').addEventListener('click', (e) => {
  if (e.target.id === 'desktop' || e.target.closest('#wallpaper')) {
    document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
  }
});

// ═══════════════════════════════════════════════════════════
// Search Icon — Spotlight-like effect (placeholder)
// ═══════════════════════════════════════════════════════════

document.getElementById('searchIcon')?.addEventListener('click', () => {
  // Could show a spotlight search in the future
  // For now just pulse the logo
  const logo = document.getElementById('menuLogo');
  if (logo) {
    logo.style.transform = 'scale(1.3)';
    setTimeout(() => logo.style.transform = '', 200);
  }
});

// ═══════════════════════════════════════════════════════════
// Prevent text selection on double-click
// ═══════════════════════════════════════════════════════════

document.addEventListener('mousedown', (e) => {
  if (e.detail > 1 && !e.target.closest('input') && !e.target.closest('textarea')) {
    e.preventDefault();
  }
});

// ═══════════════════════════════════════════════════════════
// Init
// ═══════════════════════════════════════════════════════════

// Ensure desktop transitions are smooth on load
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.6s ease-out';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
});
