#!/bin/bash
# LocalContent.ai Codebase Consolidation Script
# Run this on the VPS: bash /root/clawd-work/localcontent_ai/strategic_plans/consolidation_script.sh

set -e  # Exit on error

WORK_DIR="/root/clawd-work/localcontent_ai"
ARCHIVE_DIR="$WORK_DIR/_archive"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "=========================================="
echo "LocalContent.ai Codebase Consolidation"
echo "Timestamp: $TIMESTAMP"
echo "=========================================="

# Step 1: Create archive directory
echo ""
echo "[Step 1] Creating archive directory..."
mkdir -p "$ARCHIVE_DIR"

# Step 2: Create new directory structure
echo ""
echo "[Step 2] Creating new directory structure..."
mkdir -p "$WORK_DIR/app/(auth)/login"
mkdir -p "$WORK_DIR/app/(auth)/signup"
mkdir -p "$WORK_DIR/app/(auth)/forgot-password"
mkdir -p "$WORK_DIR/app/(dashboard)/dashboard/content"
mkdir -p "$WORK_DIR/app/(dashboard)/dashboard/templates"
mkdir -p "$WORK_DIR/app/(dashboard)/dashboard/analytics"
mkdir -p "$WORK_DIR/app/(dashboard)/dashboard/settings"
mkdir -p "$WORK_DIR/app/(dashboard)/onboarding"
mkdir -p "$WORK_DIR/app/(marketing)"
mkdir -p "$WORK_DIR/app/api/content"
mkdir -p "$WORK_DIR/app/api/templates"
mkdir -p "$WORK_DIR/app/api/analytics"
mkdir -p "$WORK_DIR/app/api/stripe"
mkdir -p "$WORK_DIR/app/api/integrations/gmb"
mkdir -p "$WORK_DIR/components/ui"
mkdir -p "$WORK_DIR/components/dashboard"
mkdir -p "$WORK_DIR/components/auth"
mkdir -p "$WORK_DIR/components/marketing"
mkdir -p "$WORK_DIR/lib/supabase"
mkdir -p "$WORK_DIR/lib/ai"
mkdir -p "$WORK_DIR/lib/stripe"
mkdir -p "$WORK_DIR/hooks"
mkdir -p "$WORK_DIR/types"
mkdir -p "$WORK_DIR/public"
mkdir -p "$WORK_DIR/supabase/migrations"

echo "Directory structure created."

# Step 3: Copy foundation files from localcontent_infra
echo ""
echo "[Step 3] Copying foundation files from localcontent_infra..."

if [ -f "$WORK_DIR/localcontent_infra/package.json" ]; then
    cp "$WORK_DIR/localcontent_infra/package.json" "$WORK_DIR/"
    echo "  - Copied package.json"
fi

if [ -f "$WORK_DIR/localcontent_infra/tailwind.config.ts" ]; then
    cp "$WORK_DIR/localcontent_infra/tailwind.config.ts" "$WORK_DIR/"
    echo "  - Copied tailwind.config.ts"
fi

if [ -f "$WORK_DIR/localcontent_infra/postcss.config.js" ]; then
    cp "$WORK_DIR/localcontent_infra/postcss.config.js" "$WORK_DIR/"
    echo "  - Copied postcss.config.js"
fi

if [ -f "$WORK_DIR/localcontent_infra/next.config.js" ]; then
    cp "$WORK_DIR/localcontent_infra/next.config.js" "$WORK_DIR/"
    echo "  - Copied next.config.js"
fi

if [ -f "$WORK_DIR/localcontent_infra/middleware.ts" ]; then
    cp "$WORK_DIR/localcontent_infra/middleware.ts" "$WORK_DIR/"
    echo "  - Copied middleware.ts"
fi

if [ -f "$WORK_DIR/localcontent_infra/env.example" ]; then
    cp "$WORK_DIR/localcontent_infra/env.example" "$WORK_DIR/.env.example"
    echo "  - Copied env.example"
fi

# Step 4: Copy Supabase lib files
echo ""
echo "[Step 4] Copying Supabase configuration..."

if [ -d "$WORK_DIR/localcontent_infra/lib/supabase" ]; then
    cp -r "$WORK_DIR/localcontent_infra/lib/supabase/"* "$WORK_DIR/lib/supabase/"
    echo "  - Copied Supabase lib files"
fi

# Step 5: Copy UI components from recovered_frontend
echo ""
echo "[Step 5] Copying UI components from recovered_frontend..."

if [ -d "$WORK_DIR/recovered_frontend/components/ui" ]; then
    cp -r "$WORK_DIR/recovered_frontend/components/ui/"* "$WORK_DIR/components/ui/"
    echo "  - Copied UI components"
fi

# Step 6: Copy useful lib files from lcai_backend
echo ""
echo "[Step 6] Copying lib files from lcai_backend..."

if [ -d "$WORK_DIR/lcai_backend/lib" ]; then
    # Copy AI utilities
    if [ -d "$WORK_DIR/lcai_backend/lib/ai" ]; then
        cp -r "$WORK_DIR/lcai_backend/lib/ai/"* "$WORK_DIR/lib/ai/" 2>/dev/null || true
        echo "  - Copied AI lib files"
    fi
    
    # Copy other utilities
    for file in "$WORK_DIR/lcai_backend/lib/"*.ts; do
        if [ -f "$file" ]; then
            cp "$file" "$WORK_DIR/lib/"
            echo "  - Copied $(basename $file)"
        fi
    done
fi

# Step 7: Copy Stripe lib files
echo ""
echo "[Step 7] Copying Stripe configuration..."

if [ -f "$WORK_DIR/localcontent_infra/lib/stripe.ts" ]; then
    cp "$WORK_DIR/localcontent_infra/lib/stripe.ts" "$WORK_DIR/lib/stripe/"
    echo "  - Copied stripe.ts"
fi

# Step 8: Copy database migrations
echo ""
echo "[Step 8] Copying database migrations..."

if [ -d "$WORK_DIR/lcai_backend/supabase" ]; then
    cp -r "$WORK_DIR/lcai_backend/supabase/"* "$WORK_DIR/supabase/migrations/" 2>/dev/null || true
    echo "  - Copied database migrations"
fi

if [ -d "$WORK_DIR/localcontent_backend/supabase" ]; then
    cp -r "$WORK_DIR/localcontent_backend/supabase/"* "$WORK_DIR/supabase/migrations/" 2>/dev/null || true
    echo "  - Copied additional migrations"
fi

# Step 9: Create lib/utils.ts if missing
echo ""
echo "[Step 9] Creating lib/utils.ts..."

if [ ! -f "$WORK_DIR/lib/utils.ts" ]; then
    cat > "$WORK_DIR/lib/utils.ts" << 'EOF'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
EOF
    echo "  - Created lib/utils.ts"
else
    echo "  - lib/utils.ts already exists"
fi

# Step 10: Archive old folders
echo ""
echo "[Step 10] Archiving old folders..."

for folder in web localcontent_infra localcontent_backend lcai_backend recovered_frontend; do
    if [ -d "$WORK_DIR/$folder" ]; then
        mv "$WORK_DIR/$folder" "$ARCHIVE_DIR/${folder}_$TIMESTAMP"
        echo "  - Archived $folder"
    fi
done

# Step 11: Create tsconfig.json if missing
echo ""
echo "[Step 11] Checking tsconfig.json..."

if [ ! -f "$WORK_DIR/tsconfig.json" ]; then
    cat > "$WORK_DIR/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "_archive"]
}
EOF
    echo "  - Created tsconfig.json"
else
    echo "  - tsconfig.json already exists"
fi

# Summary
echo ""
echo "=========================================="
echo "Consolidation Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. cd $WORK_DIR"
echo "2. npm install"
echo "3. Verify npm run dev works"
echo "4. Create app/layout.tsx and app/globals.css"
echo "5. Continue with Phase B of recovery plan"
echo ""
echo "Archive location: $ARCHIVE_DIR"
echo ""
echo "To restore if needed:"
echo "  cp -r $ARCHIVE_DIR/[folder]_$TIMESTAMP $WORK_DIR/[folder]"
