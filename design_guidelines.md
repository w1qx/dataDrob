# Design Guidelines: Excel & CSV File Upload Application

## Design Approach

**Hybrid Approach** inspired by modern file management tools (Dropbox, WeTransfer) with Linear's clean typography and Stripe's restrained use of gradients. This utility-focused application requires clarity and efficiency while incorporating requested visual enhancement through animated gradients.

## Core Design Elements

### Typography
- **Primary Font**: Inter (Google Fonts) - clean, readable for data and UI
- **Heading Scale**: text-4xl (hero), text-2xl (section headers), text-lg (subsections)
- **Body Text**: text-base for descriptions, text-sm for metadata and table content
- **Font Weights**: font-semibold for headings, font-medium for buttons/labels, font-normal for body

### Layout System
**Tailwind Spacing Units**: Consistently use 4, 6, 8, 12, 16, 24 for all spacing
- Compact spacing: p-4, gap-4 (mobile, dense areas)
- Standard spacing: p-8, gap-6 (desktop content)
- Section spacing: py-16 or py-24 (vertical breathing room)

**Container Strategy**:
- Main container: max-w-4xl mx-auto for focused upload zone
- Data table: max-w-6xl mx-auto for wider preview area
- Mobile: px-4, Desktop: px-8

### Animated Gradient Background
- **Full-page gradient** with subtle animation (slow 15-20s loop)
- Gradient direction: diagonal (top-left to bottom-right)
- Two implementation layers: base gradient + animated overlay for depth
- Ensure sufficient contrast for white/light content cards overlaid on gradient

### Component Library

**Upload Zone** (Hero Component)
- Large drag-and-drop area with dashed border and hover state
- Center-aligned icon (cloud upload), heading, file format text
- Browse button with backdrop blur if gradient shows through
- Drop zone expansion on dragover state
- Dimensions: min-h-64 on mobile, min-h-80 on desktop

**File Info Card**
- Appears post-upload with file icon, name, size, type, row count
- Horizontal layout on desktop (icon left, info center, actions right)
- Stacked layout on mobile
- Clear remove/replace actions

**Data Preview Table**
- Clean table with alternating row backgrounds for readability
- Fixed header row that remains visible on scroll
- Responsive: horizontal scroll on mobile with sticky first column
- Display 15-20 rows maximum with "showing X of Y rows" indicator
- Compact cell padding: px-4 py-2

**Error/Success Messages**
- Toast-style notifications with icons
- Position: top-center with backdrop blur
- Auto-dismiss after 5 seconds with manual close option
- Clear visual distinction (success: checkmark, error: alert icon)

**Progress Indicator**
- Linear progress bar during file parsing
- Percentage display for large files
- Indeterminate state for initial processing

### Responsive Breakpoints
- **Mobile**: Single column, stacked layouts, touch-optimized targets (min 44px)
- **Tablet** (md: 768px): Maintain single column for simplicity
- **Desktop** (lg: 1024px): Wider containers, horizontal file info layout

### Interactions & States
- **Drag states**: Visual feedback with border color change and scale
- **Button states**: Subtle scale on hover (scale-105), no complex animations
- **Loading states**: Spinner or skeleton for data preview while parsing
- **Empty state**: Clear instructions with illustration placeholder

### Icons
Use **Heroicons** (via CDN) for all interface icons:
- Upload cloud, file type icons, checkmark, alert, close, info icons
- Icon sizes: h-6 w-6 for standard UI, h-12 w-12 for upload zone

### Accessibility
- ARIA labels for drag-and-drop zones
- Keyboard navigation for all interactive elements
- Focus indicators with visible outlines
- Error messages announced to screen readers
- Proper heading hierarchy (h1 for main title, h2 for sections)

## Layout Structure

1. **Header Section** (optional compact header)
   - App title/logo with tagline "Upload & Preview Excel/CSV Files"
   - Subtle, doesn't compete with main upload zone

2. **Main Upload Section** (primary focus)
   - Centered upload zone as the hero component
   - Prominent heading: "Drop your file here"
   - Supported formats and size limit clearly stated
   - Browse button for traditional upload

3. **File Information Section** (conditional)
   - Appears after successful upload
   - File details card with clear visual separation from upload zone
   - Actions: Download, Remove, Upload Another

4. **Data Preview Section** (conditional)
   - Table with spreadsheet-like appearance
   - Column headers clearly differentiated
   - Pagination or scroll for large datasets

5. **Footer** (minimal)
   - File format support info, tips, or help link
   - Centered, understated presence

## Images
**No hero images required** - the animated gradient background serves as the visual backdrop. The interface should feel clean and focused on the upload functionality without distracting imagery.