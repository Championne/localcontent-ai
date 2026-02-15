# Clawdbot Tasks - January 30, 2026
## LocalContent.ai Recovery - Phase A & B Tasks

**IMPORTANT:** These are simple, mechanical tasks. Do NOT make architectural decisions. Do NOT build new features. Follow instructions exactly.

---

## TASK 1: Run Consolidation Script (PRIORITY 1)

**Location:** VPS `/root/clawd-work/localcontent_ai/`

**Instructions:**
```bash
cd /root/clawd-work/localcontent_ai
chmod +x strategic_plans/consolidation_script.sh
bash strategic_plans/consolidation_script.sh
```

**Expected Result:**
- New directory structure created
- Old folders moved to `_archive/`
- `package.json` at root level

**Verification:**
```bash
ls -la /root/clawd-work/localcontent_ai/
# Should see: app/, components/, lib/, package.json, etc.
# Should NOT see: web/, localcontent_infra/, lcai_backend/, etc.
```

**Report back:** Confirm script ran successfully and list any errors.

---

## TASK 2: Install Dependencies (PRIORITY 2)

**Prerequisite:** Task 1 complete

**Location:** VPS `/root/clawd-work/localcontent_ai/`

**Instructions:**
```bash
cd /root/clawd-work/localcontent_ai
npm install
```

**Expected Result:**
- `node_modules/` folder created
- No critical errors

**Verification:**
```bash
ls -la node_modules/ | head -10
# Should show many folders
```

**Report back:** Confirm install succeeded. List any errors or warnings.

---

## TASK 3: Create app/globals.css (PRIORITY 3)

**Prerequisite:** Task 1 complete

**Location:** VPS `/root/clawd-work/localcontent_ai/app/globals.css`

**Instructions:** Create this file with EXACTLY this content:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Verification:**
```bash
cat /root/clawd-work/localcontent_ai/app/globals.css | head -5
# Should show @tailwind directives
```

---

## TASK 4: Create app/layout.tsx (PRIORITY 4)

**Prerequisite:** Task 3 complete

**Location:** VPS `/root/clawd-work/localcontent_ai/app/layout.tsx`

**Instructions:** Create this file with EXACTLY this content:

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LocalContent.ai - AI Content for Local Businesses',
  description: 'Generate SEO-optimized content for your local business in minutes, not hours.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

**Verification:**
```bash
cat /root/clawd-work/localcontent_ai/app/layout.tsx
```

---

## TASK 5: Create Placeholder Landing Page (PRIORITY 5)

**Prerequisite:** Task 4 complete

**Location:** VPS `/root/clawd-work/localcontent_ai/app/page.tsx`

**Instructions:** Create this file:

```typescript
export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-center mb-4">
        LocalContent.ai
      </h1>
      <p className="text-xl text-muted-foreground text-center mb-8">
        AI-Powered Content for Local Businesses
      </p>
      <div className="flex gap-4">
        <a 
          href="/login" 
          className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Login
        </a>
        <a 
          href="/signup" 
          className="px-6 py-3 border border-input rounded-md hover:bg-accent"
        >
          Sign Up
        </a>
      </div>
    </main>
  )
}
```

---

## TASK 6: Verify Dev Server Starts (PRIORITY 6)

**Prerequisite:** Tasks 1-5 complete

**Location:** VPS `/root/clawd-work/localcontent_ai/`

**Instructions:**
```bash
cd /root/clawd-work/localcontent_ai
npm run dev
```

Wait 30 seconds, then check if it's running.

**Expected Result:**
- Server starts on port 3000
- No critical errors

**If errors occur:** 
1. Copy the FULL error message
2. DO NOT try to fix it yourself
3. Report back with the error

**Report back:** Confirm server starts or provide error messages.

---

## TASK 7: Create shadcn/ui Button Component (PRIORITY 7)

**Prerequisite:** Task 6 passes

**Location:** VPS `/root/clawd-work/localcontent_ai/components/ui/button.tsx`

**Instructions:** Create this file (standard shadcn/ui button):

```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

---

## TASK 8: Create shadcn/ui Input Component (PRIORITY 8)

**Location:** VPS `/root/clawd-work/localcontent_ai/components/ui/input.tsx`

```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

---

## TASK 9: Create shadcn/ui Label Component (PRIORITY 9)

**Location:** VPS `/root/clawd-work/localcontent_ai/components/ui/label.tsx`

```typescript
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
```

---

## TASK 10: Create shadcn/ui Card Component (PRIORITY 10)

**Location:** VPS `/root/clawd-work/localcontent_ai/components/ui/card.tsx`

```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

---

## STOP HERE AND REPORT

After completing Tasks 1-10, STOP and report:

1. Which tasks completed successfully?
2. Which tasks had errors? (Include full error messages)
3. Does `npm run dev` work?

**DO NOT continue to authentication or other features.** Wait for further instructions from Cursor.

---

## Rules for Clawdbot

1. **Follow instructions EXACTLY** - no creativity needed
2. **Report errors immediately** - don't try to fix them
3. **Stay in localcontent_ai directory** - never go to Gratisschadeverhalen.nl
4. **Commit after each major task** with message: "recovery: [task description]"
5. **No new features** - only what's in this task list

---

*Created: January 30, 2026*
*For: Clawdbot on VPS*
