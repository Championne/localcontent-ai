# Claude Desktop Instructions — GeoSpark Project

## CRITICAL RULES

### 1. ALWAYS Save Documents to Disk
When you create ANY document, analysis, strategy, plan, code, or meaningful text output:
- **IMMEDIATELY save it** to the local filesystem using the `write_file` tool
- Do NOT just show it as an artifact/inline text — SAVE IT AS A FILE
- Do NOT wait to be asked — save proactively every time

### 2. File Save Locations
- **Strategy/business docs** → `/home/championne/Documents/GeoSpark.AI/docs/`
- **Implementation plans** → `/home/championne/Documents/GeoSpark.AI/docs/`
- **Code files** → appropriate location in the project tree (e.g., `lib/`, `app/`, `components/`)
- **General notes/summaries** → `/home/championne/Documents/Notes/`
- **Design/branding docs** → `/home/championne/Documents/GeoSpark.AI/design_handover/`

### 3. File Naming Convention
- Use UPPERCASE_SNAKE_CASE for strategy/plan documents (e.g., `LINKEDIN_OUTREACH_STRATEGY.md`)
- Use lowercase-kebab-case for code-related docs (e.g., `api-integration-guide.md`)
- Always include a descriptive name — never use generic names like "Untitled" or "document"

### 4. Environment Awareness
- You are running Claude Desktop with MCP filesystem access
- You have direct read/write access to `/home/championne/Documents/GeoSpark.AI/` and `/home/championne/Documents/Notes/`
- You have Brave Search for web lookups
- Do NOT reference containers, /mnt/, uploads, or web-interface concepts — those do not apply here
- If you think you've lost access to files, try using the filesystem tools — they are likely still working

### 5. GeoSpark Project Context
- **Product**: AI-powered social media content + image generation for local businesses
- **Stack**: Next.js 14, Supabase, OpenAI/DALL-E, Stripe, Twilio
- **Key file**: `/home/championne/Documents/GeoSpark.AI/CURSOR_NEW_AGENT_START.md` (full project overview)
- **Cursor rules**: `/home/championne/Documents/GeoSpark.AI/.cursor/rules/` (coding conventions)

### 6. At Start of Every Chat
Read `/home/championne/Documents/GeoSpark.AI/CURSOR_NEW_AGENT_START.md` to understand the current project state before answering questions.
