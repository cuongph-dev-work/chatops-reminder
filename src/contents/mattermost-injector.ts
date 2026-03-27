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

  const btn = document.createElement("button")
  btn.className = REMIND_ME_BTN_CLASS
  btn.setAttribute("role", "menuitem")
  btn.style.cssText = `
    display: flex;
    align-items: center;
    width: 100%;
    padding: 6px 16px;
    font-size: 14px;
    color: inherit;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    gap: 8px;
  `
  btn.innerHTML = `
    <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg">
      <path fill="none" d="M0 0h24v24H0z"></path>
      <path d="M12 20a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm0 2a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm-.25-16h1.5v5l3.6 2.1-.75 1.2-4.35-2.55V6zM17 3.3l1.8-1.5 2.15 2.5-1.8 1.5L17 3.3zm-10-1.5L8.8 3.3 5.4 1.8 3.25 4.3 5.4 5.8 7 3.3z"></path>
    </svg>
    <span>Remind Me</span>
  `

  btn.addEventListener("click", (e) => {
    e.preventDefault()
    e.stopPropagation()

    // Close the dropdown
    menu.remove()

    // Open reminder modal
    const event = new CustomEvent("chatops:open-reminder-modal", {
      detail: { messageLink: permalink ?? window.location.href }
    })
    document.dispatchEvent(event)
  })

  // Insert as first or last item
  menu.appendChild(btn)
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
  } else {
    document.addEventListener("DOMContentLoaded", setupObserver)
  }
}
