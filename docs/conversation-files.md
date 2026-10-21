# Conversation files

Saved conversations use schema version 1. The file contains the conversation identity, title, optional model and system prompt, timestamps, and every message.

Writes are atomic: Relay Chat writes a private temporary file beside the destination and renames it only after the content is complete. Parent directories are created when necessary.

Conversation JSON can contain prompts, replies, and system instructions. Keep these files out of public repositories when their contents are sensitive. The default `conversations/` directory is ignored by Git.

Exports omit internal identifiers while retaining message order, model labels, errors, and the system prompt. `/export` chooses the format from the file extension: Markdown by default, plain text for `.txt`, and a standalone page with escaped content for `.html`.
