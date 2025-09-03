/**
 * UI components and interactions (TypeScript)
 */

import { DOM } from "./config";
import { resizeGraph } from "./schema";

export function toggleContainer(container: HTMLElement, onOpen?: () => void) {
  const isMobile = window.innerWidth <= 768;

  const allContainers = document.querySelectorAll(".sidebar-container");
  allContainers.forEach((c) => {
    if (c !== container && c.classList.contains("open")) {
      c.classList.remove("open");
      // Clear the inline width style when closing other panels
      (c as HTMLElement).style.width = '';
    }
  });

  if (!container.classList.contains("open")) {
    container.classList.add("open");
    
    // Reset to default 50% width when opening
    if (!isMobile) {
      container.style.width = '50%';
    }

    if (!isMobile && DOM.chatContainer) {
      DOM.chatContainer.style.paddingRight = "10%";
      DOM.chatContainer.style.paddingLeft = "10%";
    }
    if (onOpen) onOpen();
  } else {
    container.classList.remove("open");
    
    // Clear any inline width style that was set during resizing
    container.style.width = '';

    if (!isMobile && DOM.chatContainer) {
      DOM.chatContainer.style.paddingRight = "20%";
      DOM.chatContainer.style.paddingLeft = "20%";
    }
  }
}

export function showResetConfirmation() {
  if (DOM.resetConfirmationModal)
    DOM.resetConfirmationModal.style.display = "flex";
  setTimeout(() => {
    DOM.resetConfirmBtn?.focus();
  }, 100);
}

export function hideResetConfirmation() {
  if (DOM.resetConfirmationModal)
    DOM.resetConfirmationModal.style.display = "none";
}

export function handleResetConfirmation() {
  hideResetConfirmation();
  import("./messages").then(({ initChat }) => {
    initChat();
  });
}

export function setupUserProfileDropdown() {
  const userProfileBtn = document.getElementById("user-profile-btn");
  const userProfileDropdown = document.getElementById("user-profile-dropdown");

  if (userProfileBtn && userProfileDropdown) {
    userProfileBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      userProfileDropdown.classList.toggle("show");
    });

    document.addEventListener("click", function (e) {
      if (
        !userProfileBtn.contains(e.target as Node) &&
        !userProfileDropdown.contains(e.target as Node)
      ) {
        userProfileDropdown.classList.remove("show");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (
        e.key === "Escape" &&
        userProfileDropdown.classList.contains("show")
      ) {
        userProfileDropdown.classList.remove("show");
      }
    });

    userProfileDropdown.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }
}

export function setupThemeToggle() {
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const currentTheme = localStorage.getItem("theme") || "system";
  document.documentElement.setAttribute("data-theme", currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", function () {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      let newTheme: string;

      switch (currentTheme) {
        case "dark":
          newTheme = "light";
          break;
        case "light":
          newTheme = "system";
          break;
        case "system":
        default:
          newTheme = "dark";
          break;
      }

      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);

      const titles: Record<string, string> = {
        dark: "Switch to Light Mode",
        light: "Switch to System Mode",
        system: "Switch to Dark Mode",
      };
      (themeToggleBtn as HTMLElement).title = titles[newTheme];
    });

    const titles: Record<string, string> = {
      dark: "Switch to Light Mode",
      light: "Switch to System Mode",
      system: "Switch to Dark Mode",
    };
    (themeToggleBtn as HTMLElement).title = titles[currentTheme];
  }
}

export function setupToolbar() {
  const toolbar = document.getElementById("toolbar-buttons");
  if (toolbar) {
    const buttons = Array.from(
      toolbar.querySelectorAll("button.toolbar-button")
    ) as HTMLButtonElement[];
    buttons.forEach((b, i) => b.setAttribute("tabindex", i === 0 ? "0" : "-1"));

    toolbar.addEventListener("keydown", (e) => {
      const focused = document.activeElement as HTMLElement | null;
      const idx = buttons.indexOf(focused as HTMLButtonElement);
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        const next = buttons[(idx + 1) % buttons.length];
        if (next) {
          buttons.forEach((b) => b.setAttribute("tabindex", "-1"));
          next.setAttribute("tabindex", "0");
          next.focus();
        }
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        const prev = buttons[(idx - 1 + buttons.length) % buttons.length];
        if (prev) {
          buttons.forEach((b) => b.setAttribute("tabindex", "-1"));
          prev.setAttribute("tabindex", "0");
          prev.focus();
        }
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (focused) (focused as HTMLElement).click();
      }
    });
  }
}

export function handleWindowResize() {
  const isMobile = window.innerWidth <= 768;

  const allContainers = document.querySelectorAll(".sidebar-container");
  allContainers.forEach((c) => {
    if (isMobile && c.classList.contains("open") && DOM.chatContainer) {
      DOM.chatContainer.style.paddingRight = "";
      DOM.chatContainer.style.paddingLeft = "";
    } else if (!isMobile && c.classList.contains("open") && DOM.chatContainer) {
      DOM.chatContainer.style.paddingRight = "10%";
      DOM.chatContainer.style.paddingLeft = "10%";
    } else if (
      !isMobile &&
      !c.classList.contains("open") &&
      DOM.chatContainer
    ) {
      DOM.chatContainer.style.paddingRight = "20%";
      DOM.chatContainer.style.paddingLeft = "20%";
    }
  });

  setTimeout(resizeGraph, 450);
}

export function setupCustomDropdown() {
  const dropdown = document.getElementById(
    "database-type-dropdown"
  ) as HTMLElement;
  const selected = dropdown?.querySelector(".dropdown-selected") as HTMLElement;
  const options = dropdown?.querySelector(".dropdown-options") as HTMLElement;
  const hiddenInput = document.getElementById(
    "database-type-select"
  ) as HTMLInputElement;

  selected.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("open");
    selected.classList.toggle("active");
  });

  options.addEventListener("click", (e) => {
    const option = (e.target as HTMLElement).closest(
      ".dropdown-option"
    ) as HTMLElement;
    if (!option) return;

    const value = option.dataset.value || "";
    const text = option.querySelector("span")?.textContent || "";
    const icon = option
      .querySelector(".db-icon")
      ?.cloneNode(true) as Node | null;

    const dropdownText = selected.querySelector(
      ".dropdown-text"
    ) as HTMLElement | null;
    if (dropdownText) dropdownText.innerHTML = "";
    if (icon && dropdownText) dropdownText.appendChild(icon);
    if (dropdownText) dropdownText.appendChild(document.createTextNode(text));

    hiddenInput.value = value;
    dropdown.classList.remove("open");
    selected.classList.remove("active");

    const changeEvent = new Event("change", { bubbles: true });
    hiddenInput.dispatchEvent(changeEvent);
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target as Node)) {
      dropdown.classList.remove("open");
      selected.classList.remove("active");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && dropdown.classList.contains("open")) {
      dropdown.classList.remove("open");
      selected.classList.remove("active");
    }
  });
}

export function setupResizeHandles() {
  const resizeHandles = document.querySelectorAll('.resize-handle');
  
  resizeHandles.forEach(handle => {
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;
    let targetContainer: HTMLElement | null = null;
    
    const handleMouseDown = (e: MouseEvent | { clientX: number; preventDefault: () => void }) => {
      isResizing = true;
      startX = e.clientX;
      
      // Get the target container from data-target attribute
      const targetId = (handle as HTMLElement).getAttribute('data-target');
      targetContainer = targetId ? document.getElementById(targetId) : null;
      
      if (targetContainer) {
        startWidth = targetContainer.offsetWidth;
        (handle as HTMLElement).classList.add('resizing');
        targetContainer.classList.add('resizing');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
      }
      
      e.preventDefault();
    };
    
    const handleMouseMove = (e: MouseEvent | { clientX: number }) => {
      if (!isResizing || !targetContainer) return;
      
      const deltaX = e.clientX - startX;
      const newWidth = startWidth + deltaX;
      
      // Get parent container width for percentage calculations
      const parentWidth = targetContainer.parentElement?.offsetWidth || window.innerWidth;
      const newWidthPercent = (newWidth / parentWidth) * 100;
      
      // Set minimum and maximum widths as percentages of parent
      const collapseThreshold = 25; // 25% of parent width
      const maxWidthPercent = 60; // 60% of parent width
      
      // If width goes below 25%, collapse the panel
      if (newWidthPercent < collapseThreshold) {
        // Directly close the container
        const isMobile = window.innerWidth <= 768;
        targetContainer.classList.remove('open');
        
        // Clear the inline width style that was set during resizing
        targetContainer.style.width = '';
        
        // Reset chat container padding when closing
        if (!isMobile && DOM.chatContainer) {
          DOM.chatContainer.style.paddingRight = "20%";
          DOM.chatContainer.style.paddingLeft = "20%";
        }
        
        // Clean up resize state
        isResizing = false;
        (handle as HTMLElement).classList.remove('resizing');
        targetContainer.classList.remove('resizing');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        targetContainer = null;
        return;
      }
      
      const clampedWidthPercent = Math.max(collapseThreshold, Math.min(maxWidthPercent, newWidthPercent));
      targetContainer.style.width = clampedWidthPercent + '%';
      
      // Trigger graph resize if schema container is being resized
      if (targetContainer.id === 'schema-container' && targetContainer.classList.contains('open')) {
        setTimeout(() => {
          resizeGraph();
        }, 50);
      }
    };
    
    const handleMouseUp = () => {
      if (isResizing) {
        isResizing = false;
        (handle as HTMLElement).classList.remove('resizing');
        if (targetContainer) {
          targetContainer.classList.remove('resizing');
        }
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        targetContainer = null;
      }
    };
    
    handle.addEventListener('mousedown', handleMouseDown as EventListener);
    document.addEventListener('mousemove', handleMouseMove as EventListener);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Handle touch events for mobile
    handle.addEventListener('touchstart', (e: Event) => {
      const touchEvent = e as TouchEvent;
      const touch = touchEvent.touches[0];
      handleMouseDown({ 
        clientX: touch.clientX, 
        preventDefault: () => e.preventDefault() 
      });
    });
    
    document.addEventListener('touchmove', (e: Event) => {
      if (isResizing) {
        const touchEvent = e as TouchEvent;
        const touch = touchEvent.touches[0];
        handleMouseMove({ clientX: touch.clientX });
        e.preventDefault();
      }
    });
    
    document.addEventListener('touchend', handleMouseUp);
  });
}
