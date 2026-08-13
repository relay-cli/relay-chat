# Security

## Reporting

Please report a vulnerability privately through GitHub's security advisory form for this repository. Include a minimal reproduction and the affected version.

## Local model commands

Relay Chat executes only the command explicitly supplied after `--`. It does not interpret model output as shell input. Command adapters still run with the permissions of the current user, so review third-party adapters before using them.

Conversation files may contain private prompts and replies. The default conversation directory is ignored by Git, but files saved elsewhere follow the permissions and backup policy of that location.
