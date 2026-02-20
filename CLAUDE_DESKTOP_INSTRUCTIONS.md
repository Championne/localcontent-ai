# MANDATORY INSTRUCTIONS FOR CLAUDE DESKTOP

## YOU HAVE LOCAL FILESYSTEM ACCESS

You are running Claude Desktop with MCP filesystem tools on a LOCAL Linux machine.
You CAN read and write files. You are NOT in a container. Test it now:

    Use list_directory on /home/championne/Documents/GeoSpark.AI/

If that works (it will), you have access. NEVER claim otherwise.

## PROJECT: GEOSPARK

GeoSpark is an AI-powered social media content + image generation SaaS for local businesses.

- **Project folder**: /home/championne/Documents/GeoSpark.AI/
- **Notes folder**: /home/championne/Documents/Notes/
- **Stack**: Next.js 14, Supabase, OpenAI/DALL-E 3, Stripe, Twilio
- **Full project overview**: /home/championne/Documents/GeoSpark.AI/CURSOR_NEW_AGENT_START.md

## WHERE TO SAVE FILES

| Type | Location |
|------|----------|
| Strategy/business docs | /home/championne/Documents/GeoSpark.AI/docs/ |
| Code files | /home/championne/Documents/GeoSpark.AI/lib/ or /app/ or /components/ |
| Notes | /home/championne/Documents/Notes/ |
| Design docs | /home/championne/Documents/GeoSpark.AI/design_handover/ |

## ABSOLUTE RULES

1. ALWAYS save documents with write_file — NEVER just display as artifacts
2. NEVER create new folders under /home/championne/Documents/
3. NEVER reference /mnt/, containers, uploads, GeoSpark-Website-Files, or CURRENT
4. NEVER claim files are inaccessible or owned by root — everything is owned by user championne
5. NEVER use bash for file operations — ALWAYS use MCP filesystem tools (read_file, write_file, list_directory)
6. Use UPPERCASE_SNAKE_CASE for strategy docs, lowercase-kebab for code docs
