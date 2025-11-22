"""Explore the feelings wheel app - Full flow with placing pins."""
from playwright.sync_api import sync_playwright
import os

os.makedirs('/tmp/feelings_wheel_screenshots', exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1400, 'height': 900})

    # Navigate to the feelings wheel app
    print("Navigating to feelings wheel app...")
    page.goto('https://feelings-mapify.lovable.app')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1000)

    # Click the Generate button to create a room code
    print("Clicking Generate button...")
    page.click('button:has-text("Generate")')
    page.wait_for_timeout(500)

    # Click Join Room button
    print("Clicking Join Room button...")
    page.click('button:has-text("Join Room")')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1000)

    # Now we're on the "Join the Feelings Room" modal
    # Fill in the name
    print("Filling in name...")
    page.fill('input[placeholder="Enter your name"]', 'Test User')
    page.wait_for_timeout(300)

    # Select a different avatar (e.g., Cat)
    print("Selecting Cat avatar...")
    page.click('button:has-text("Cat")')
    page.wait_for_timeout(300)

    # Select a different color (e.g., Blue)
    print("Selecting Blue color...")
    page.click('button:has-text("Blue")')
    page.wait_for_timeout(300)

    page.screenshot(path='/tmp/feelings_wheel_screenshots/04_user_setup.png', full_page=True)
    print("Screenshot 4: User setup complete")

    # Look for a "Join" or "Continue" button to submit
    join_buttons = page.locator('button').all()
    print("\nLooking for submit button...")
    for btn in join_buttons:
        try:
            text = btn.inner_text()
            if 'join' in text.lower() or 'continue' in text.lower() or 'start' in text.lower():
                print(f"Found potential submit button: {text}")
        except:
            pass

    # Try to close the modal or find the submit button
    # Check if there's a close button that we can use after setting up
    close_button = page.locator('button:has-text("Close")')
    if close_button.count() > 0:
        print("Closing modal...")
        close_button.click()
        page.wait_for_timeout(1000)

    page.screenshot(path='/tmp/feelings_wheel_screenshots/05_after_close_modal.png', full_page=True)
    print("Screenshot 5: After closing modal")

    # Now let's see what the page looks like
    print(f"\nPage URL: {page.url}")

    # Get the full HTML to understand the wheel structure
    html = page.content()
    with open('/tmp/feelings_wheel_screenshots/wheel_page_html.txt', 'w') as f:
        f.write(html)
    print("Saved page HTML")

    # Look for the wheel element
    wheel = page.locator('[class*="wheel"]')
    print(f"Found {wheel.count()} wheel elements")

    # Look for SVG elements that might be the wheel
    svgs = page.locator('svg').all()
    print(f"Found {len(svgs)} SVG elements")

    # Try to find clickable segments in the wheel
    # Usually feelings wheels have segments organized by emotion
    segments = page.locator('svg path').all()
    print(f"Found {len(segments)} SVG path elements (potential wheel segments)")

    browser.close()
    print("\nExploration complete!")
