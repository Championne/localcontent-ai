# Claude Desktop Instructions — GeoSpark Project

## READ THIS FIRST — MANDATORY RULES

You are running in Claude Desktop with MCP filesystem access on a LOCAL Linux machine.
You are NOT in a container. You are NOT on claude.ai web. You do NOT have /mnt/ paths.
You have DIRECT read/write access to the folders listed below.

---

## RULE 1: FILE SAVE LOCATIONS (NEVER DEVIATE)

The ONLY folder for GeoSpark project files is:

    /home/championne/Documents/GeoSpark.AI/

NEVER create files in:
- /home/championne/Documents/GeoSpark-Website-Files/ (does NOT exist, do NOT create it)
- /mnt/user-data/ (does NOT exist)
- /home/championne/Documents/GeoSpark.AI/CURRENT/ (does NOT exist, do NOT create it)
- Any other folder you invent

Save locations by file type:
- Strategy/business/plan documents → /home/championne/Documents/GeoSpark.AI/docs/
- Code files → appropriate project subfolder (lib/, app/, components/, etc.)
- General notes → /home/championne/Documents/Notes/
- Design docs → /home/championne/Documents/GeoSpark.AI/design_handover/
- Cursor build guides → /home/championne/Documents/GeoSpark.AI/docs/

## RULE 2: NEVER CREATE NEW TOP-LEVEL FOLDERS

Do NOT create new directories under /home/championne/Documents/.
Use ONLY the existing folder structure inside GeoSpark.AI/.
If you need a subfolder inside GeoSpark.AI/, use an existing one (docs/, lib/, app/, etc.).

## RULE 3: ALWAYS SAVE — NEVER JUST DISPLAY

When you create ANY document, analysis, strategy, or plan:
1. IMMEDIATELY save it to disk using the write_file tool
2. Do NOT just show it as an artifact — that data is LOST when the chat ends
3. Save FIRST, then show a summary in the chat
4. Confirm the save by reading the file back

## RULE 4: FILE OWNERSHIP

All files in /home/championne/ are owned by the user "championne".
There is NO root ownership issue. Do NOT claim files are inaccessible due to permissions.
If a file operation fails, report the exact error — do not guess at the cause.

## RULE 5: ENVIRONMENT FACTS

- OS: Linux Mint Cinnamon
- User: championne
- Project path: /home/championne/Documents/GeoSpark.AI/
- Notes path: /home/championne/Documents/Notes/
- MCP tools available: read_file, write_file, list_directory, search_files, etc.
- Brave Search available for web lookups
- You are NOT in a Docker container
- You are NOT on the claude.ai web interface
- There is NO /mnt/ directory relevant to you
- There is NO uploads directory

## RULE 6: FILE NAMING

- Strategy documents: UPPERCASE_SNAKE_CASE.md (e.g., COLD_OUTREACH_STRATEGY.md)
- Code docs: lowercase-kebab-case.md (e.g., api-integration-guide.md)
- Never use generic names like "Untitled" or "document"

## RULE 7: AT THE START OF EVERY CHAT

1. Read this file: /home/championne/Documents/GeoSpark.AI/CLAUDE_DESKTOP_INSTRUCTIONS.md
2. Read the project overview: /home/championne/Documents/GeoSpark.AI/CURSOR_NEW_AGENT_START.md
3. CONFIRM you have filesystem access by listing /home/championne/Documents/GeoSpark.AI/

## RULE 8: IF YOU THINK YOU LOST ACCESS

You probably didn't. Try using the filesystem tools (list_directory, read_file).
If they work, you have access. Do NOT claim otherwise.
If they genuinely fail, report the exact MCP error message.

## PROJECT CONTEXT

- Product: GeoSpark — AI-powered social media content + image generation for local businesses
- Stack: Next.js 14, Supabase, OpenAI/DALL-E, Stripe, Twilio
- The user also works on this project in Cursor IDE
- All code changes should be described in docs so Cursor can implement them
