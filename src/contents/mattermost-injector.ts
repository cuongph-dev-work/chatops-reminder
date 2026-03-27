// src/contents/mattermost-injector.ts
// Content script: MutationObserver to detect Mattermost action menus and inject "Remind Me" button

import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://*/*", "http://*/*"],
  run_at: "document_idle"
}

const REMIND_ME_BTN_CLASS = "chatops-remind-me-btn"

// Detect if current page is Mattermost
function isMattermostPage(): boolean {
  // Check URL patterns typical of Mattermost
  const url = window.location.href
  const urlMatch =
    url.includes("/channels/") ||
    url.includes("/direct-messages/") ||
    url.includes("/messages/")

  // Check for Mattermost DOM markers
  const hasMattermostMarker =
    document.querySelector("#channel-header") !== null ||
    document.querySelector(".channel-header") !== null ||
    document.querySelector("[data-testid='channel-header']") !== null ||
    document.querySelector(".Mattermost") !== null ||
    document.querySelector("#root") !== null

  return urlMatch || hasMattermostMarker
}

// Extract message permalink from a Mattermost post element
function extractPermalink(element: Element): string | null {
  // Walk up DOM to find the post container
  let post: Element | null = element
  while (post && !post.matches("[data-post-id], .post, article[id]")) {
    post = post.parentElement
  }
  if (!post) return null

  // Extract post ID from data attribute or id
  const postId =
    post.getAttribute("data-post-id") ||
    post.getAttribute("id")?.replace("post_", "") ||
    post.querySelector("[data-post-id]")?.getAttribute("data-post-id")

  if (!postId) return null

  const teamName =
    window.location.pathname.split("/")[1] ?? "default"
  return `${window.location.origin}/${teamName}/pl/${postId}`
}

// Create and inject the "Remind Me" button into a dropdown menu
function injectRemindMeButton(menu: Element, triggerElement: Element): void {
  // Don't inject if already present
  if (menu.querySelector(`.${REMIND_ME_BTN_CLASS}`)) return

  const permalink = extractPermalink(triggerElement)

  // Use Mattermost's native menu item structure: <li class="MenuItem"><button>...</button></li>
  const li = document.createElement("li")
  li.className = "MenuItem"
  li.setAttribute("role", "presentation")

  const btn = document.createElement("button")
  btn.className = `${REMIND_ME_BTN_CLASS} style--none`
  btn.setAttribute("role", "presentation")
  btn.innerHTML = `<i class="fa fa-clock-o" style="margin-right: 10px; color: var(--button-bg); position: relative;"></i>Remind Me`

  btn.addEventListener("click", (e) => {
    e.preventDefault()
    e.stopPropagation()

    // Close the dropdown by clicking outside — avoids React DOM conflicts
    document.body.click()

    // Store pending reminder data and notify background to open popup
    const pendingData = {
      link: permalink ?? window.location.href,
      pageTitle: document.title
    }
    chrome.storage.local.set({ pendingReminder: pendingData }, () => {
      chrome.runtime.sendMessage({
        type: "OPEN_POPUP_WITH_REMINDER",
        payload: pendingData
      }).catch(() => {
        // Background may not respond, that's ok — badge will guide user
      })
    })
  })

  li.appendChild(btn)

  // Find the menu list container (ul or the menu body itself)
  const menuList = menu.querySelector("ul, .Menu__content, [role='menu']") || menu
  menuList.appendChild(li)
}

// Set up MutationObserver to detect dynamically-added dropdown menus
function setupObserver(): void {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue

        // Look for Mattermost dropdown menus / post action menus
        const menus = node.matches(
          ".dropdown-menu, .a11y-popup, [role='menu'], .popover-content"
        )
          ? [node]
          : Array.from(
              node.querySelectorAll(
                ".dropdown-menu, .a11y-popup, [role='menu'], .popover-content"
              )
            )

        for (const menu of menus) {
          // Check if this menu is a post action menu (has typical Mattermost items)
          const hasPostActions =
            menu.querySelector("[data-message-action]") !== null ||
            menu.querySelector(".MenuItem") !== null ||
            menu.querySelector("[role='menuitem']") !== null ||
            menu.textContent?.includes("Reply") ||
            menu.textContent?.includes("Copy") ||
            menu.textContent?.includes("Mark")

          if (hasPostActions) {
            injectRemindMeButton(menu, node)
          }
        }
      }
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
}

// Main entry point
if (isMattermostPage()) {
  if (document.body) {
    setupObserver()

    // Capture right-clicked post permalink for context menu integration
    document.addEventListener("contextmenu", (e) => {
      const target = e.target as Element
      if (!target) return
      const permalink = extractPermalink(target)
      // Store the permalink so background's context menu handler can use it
      chrome.storage.local.set({
        contextMenuPermalink: permalink ?? window.location.href,
        contextMenuPageTitle: document.title
      })
    })
  } else {
    document.addEventListener("DOMContentLoaded", setupObserver)
  }
}

