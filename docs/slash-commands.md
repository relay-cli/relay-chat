# Slash commands

| Command                | Purpose                            |
| ---------------------- | ---------------------------------- |
| `/help`                | Open the built-in reference        |
| `/new`                 | Start an empty conversation        |
| `/clear`               | Remove the current messages        |
| `/title <text>`        | Change the title                   |
| `/system <text\|off>`  | Set or clear the system prompt     |
| `/model <name\|off>`   | Set or clear the model label       |
| `/save [path]`         | Save versioned JSON                |
| `/load <path>`         | Load versioned JSON                |
| `/export [path]`       | Write a readable transcript        |
| `/retry`               | Retry a failed or cancelled reply  |
| `/regenerate`          | Replace the latest assistant reply |
| `/undo`                | Remove the latest exchange         |
| `/theme <relay\|mono>` | Change the terminal palette        |
| `/stats`               | Show message and token estimates   |
| `/quit`                | Close the interface                |

`/export` writes Markdown by default. A path ending in `.txt` writes plain text, and a path ending in `.html` writes a standalone web page.

Paths containing spaces may be wrapped in single or double quotes.
